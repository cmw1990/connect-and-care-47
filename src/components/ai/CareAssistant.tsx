import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";
import "@/i18n/i18n";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface BasicInfo {
  name?: string;
  age?: string;
  condition?: string;
}

interface PatientInfo {
  basic_info?: BasicInfo;
  diseases?: string[];
  medicines?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  care_tips?: string[];
}

export const CareAssistant = ({ groupId }: { groupId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentMessage]);

  const formatPatientContext = async () => {
    try {
      const { data: patientInfo, error: patientError } = await supabase
        .from('patient_info')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle();

      if (patientError) {
        console.error('Error fetching patient info:', patientError);
        return "Unable to fetch patient information.";
      }

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      const { data: updates, error: updatesError } = await supabase
        .from('care_updates')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (updatesError) {
        console.error('Error fetching updates:', updatesError);
      }

      const { data: routines, error: routinesError } = await supabase
        .from('care_routines')
        .select('*')
        .eq('group_id', groupId);

      if (routinesError) {
        console.error('Error fetching routines:', routinesError);
      }

      const typedPatientInfo = patientInfo as unknown as PatientInfo;

      return `
Care Group Context:

Patient Information:
${typedPatientInfo ? `
Name: ${typedPatientInfo.basic_info?.name || 'Not specified'}
Age: ${typedPatientInfo.basic_info?.age || 'Not specified'}
Current Condition: ${typedPatientInfo.basic_info?.condition || 'Not specified'}
Medical Conditions: ${typedPatientInfo.diseases?.join(', ') || 'None specified'}
Medications: ${typedPatientInfo.medicines ? JSON.stringify(typedPatientInfo.medicines, null, 2) : 'None specified'}
Care Tips: ${typedPatientInfo.care_tips?.join(', ') || 'None specified'}
` : 'No patient information available'}

Recent Tasks:
${tasks?.map(task => `- ${task.title} (Status: ${task.status})`).join('\n') || 'No tasks available'}

Recent Care Updates:
${updates?.map(update => `- ${update.content}`).join('\n') || 'No recent updates'}

Care Routines:
${routines?.map(routine => `- ${routine.title}: ${routine.description}`).join('\n') || 'No routines set'}

Please provide relevant and helpful information based on this context.
`.trim();
    } catch (error) {
      console.error('Error fetching context:', error);
      return "Unable to fetch complete care context. I'll do my best to help with the information available.";
    }
  };

  const processStreamResponse = async (response: Response, onDone: () => void) => {
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedMessage = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            console.log('Processing data:', data);

            if (data === '[DONE]') {
              console.log('Stream complete');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('Parsed chunk:', parsed);

              if (parsed.content) {
                accumulatedMessage += parsed.content;
                setCurrentMessage(accumulatedMessage);
                console.log('Updated current message:', accumulatedMessage);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Raw data:', data);
            }
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer) {
        console.log('Processing remaining buffer:', buffer);
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedMessage += parsed.content;
              setCurrentMessage(accumulatedMessage);
            }
          } catch (e) {
            console.error('Error parsing final buffer:', e);
          }
        }
      }

      // After the stream is complete, add the message to the chat
      if (accumulatedMessage.trim()) {
        console.log('Adding complete message to chat:', accumulatedMessage);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: accumulatedMessage
        }]);
        setCurrentMessage('');
      }
      onDone();
    } catch (error) {
      console.error('Error processing stream:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      setIsLoading(true);

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const context = await formatPatientContext();
      console.log('Context prepared:', context);

      const response = await supabase.functions.invoke('realtime-chat', {
        body: { 
          text: `
Context:
${context}

User Question: ${userMessage.content}

Please provide a clear and informative response, considering all the available information about the patient and care group.
          `.trim()
        },
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response from function');
      }

      await processStreamResponse(response.data, () => {
        setIsLoading(false);
        abortControllerRef.current = null;
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to get response",
          variant: "destructive",
        });
      }
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const getAIInsights = async () => {
    if (messages.length === 0) return;
    
    try {
      setIsLoading(true);
      
      const context = await formatPatientContext();
      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await supabase.functions.invoke('realtime-chat', {
        body: { 
          text: `
Context:
${context}

Conversation History:
${conversationHistory}

Please analyze this conversation and provide key insights and recommendations based on the discussion.
          `.trim()
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get insights');
      }

      await processStreamResponse(response.data, () => setIsLoading(false));
    } catch (error) {
      console.error('Error getting insights:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get insights",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {t('careAssistant')}
        </CardTitle>
        <LanguageSelector />
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
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-secondary'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {currentMessage && (
              <div className="flex gap-2 items-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-secondary max-w-[80%]">
                  {currentMessage}
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
            placeholder={t('askAboutCare')}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            title={t('sendMessage')}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button 
            onClick={getAIInsights} 
            disabled={isLoading || messages.length === 0}
            variant="secondary"
            className="gap-2 whitespace-nowrap"
            title={t('getAIInsights')}
          >
            <Sparkles className="h-4 w-4" />
            {t('getInsights')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};