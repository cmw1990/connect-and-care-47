import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, User, Volume2, BarChart2, Mic, Image } from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  imageUrl?: string;
}

export const CareAssistant = ({ groupId }: { groupId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentMessage]);

  const connectWebSocket = () => {
    const websocketUrl = import.meta.env.PROD 
      ? 'wss://csngjtaxbnebqfismwvs.supabase.co/functions/v1/realtime-chat'
      : 'ws://localhost:54321/functions/v1/realtime-chat';

    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chunk') {
        setCurrentMessage(prev => prev + data.content);
      } else if (data.type === 'done') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: currentMessage }
        ]);
        setCurrentMessage('');
        setIsLoading(false);
      } else if (data.type === 'error') {
        toast({
          title: "Error",
          description: "Failed to get AI response",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Error",
        description: "Connection error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    webSocketRef.current = ws;
  };

  const formatPatientContext = (patientInfo: any) => {
    if (!patientInfo) return "No specific patient information available.";

    const basicInfo = patientInfo.basic_info || {};
    const diseases = patientInfo.diseases || [];
    const medicines = patientInfo.medicines || [];
    const careTips = patientInfo.care_tips || [];

    return `
Patient Information:
Name: ${basicInfo.name || 'Not specified'}
Age: ${basicInfo.age || 'Not specified'}
Current Condition: ${basicInfo.condition || 'Not specified'}

Medical Conditions: ${diseases.length > 0 ? diseases.join(', ') : 'None specified'}

Medications: ${medicines.length > 0 
  ? medicines.map((med: any) => `${med.name} (${med.dosage}, ${med.frequency})`).join(', ') 
  : 'None specified'}

Care Tips: ${careTips.length > 0 ? careTips.join(', ') : 'None specified'}
    `.trim();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = input;
      setInput('');
      
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

      const { data: patientInfo } = await supabase
        .from('patient_info')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle();

      const context = formatPatientContext(patientInfo);

      if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }

      if (webSocketRef.current?.readyState === WebSocket.CONNECTING) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        const prompt = `
As a care assistant, use the following patient context to provide relevant and helpful information:

${context}

User Question: ${userMessage}

Please provide a clear and informative response, considering the patient's specific conditions and care requirements.
        `.trim();

        webSocketRef.current.send(JSON.stringify({ text: prompt }));
      } else {
        throw new Error('WebSocket not connected');
      }

      analyzeSentiment(userMessage);

      if (userMessage.toLowerCase().includes('show me') || userMessage.toLowerCase().includes('visualize')) {
        await generateImage(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const analyzeSentiment = async (text: string) => {
    try {
      const response = await fetch('/functions/v1/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to analyze sentiment');

      const data = await response.json();
      console.log('Sentiment analysis:', data.analysis);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      const response = await fetch('/functions/v1/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, imageUrl: data.imageUrl }
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            const base64Audio = reader.result.split(',')[1];
            
            try {
              const response = await fetch('/functions/v1/voice-to-text', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({ audioData: base64Audio }),
              });

              if (!response.ok) throw new Error('Failed to transcribe audio');

              const data = await response.json();
              setInput(data.text);
            } catch (error) {
              console.error('Error transcribing audio:', error);
              toast({
                title: "Error",
                description: "Failed to transcribe audio",
                variant: "destructive",
              });
            }
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const speakMessage = async (text: string) => {
    if (isSpeaking) return;

    try {
      setIsSpeaking(true);
      const response = await fetch('/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to generate speech');

      const { audioContent } = await response.json();
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio message",
        variant: "destructive",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Care Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'assistant'
                        ? 'bg-secondary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Generated illustration"
                      className="rounded-lg max-w-full h-auto"
                    />
                  )}
                  {message.role === 'assistant' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => speakMessage(message.content)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => analyzeSentiment(message.content)}
                      >
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => generateImage(message.content)}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {currentMessage && (
              <div className="flex gap-2 items-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className="rounded-lg px-4 py-2 bg-secondary">
                    {currentMessage}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about care advice..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
