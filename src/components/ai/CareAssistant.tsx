import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/language-selector";
import "@/i18n/i18n";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export const CareAssistant = ({ groupId }: { groupId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentMessage]);

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

      // Fetch patient info for context
      const { data: patientInfo } = await supabase
        .from('patient_info')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle();

      const context = formatPatientContext(patientInfo);

      const response = await fetch('/functions/v1/realtime-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ 
          text: `
As a care assistant, use the following patient context to provide relevant and helpful information:

${context}

User Question: ${userMessage}

Please provide a clear and informative response, considering the patient's specific conditions and care requirements.
          `.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let accumulatedMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'chunk') {
                accumulatedMessage += parsed.content;
                setCurrentMessage(accumulatedMessage);
              } else if (parsed.type === 'done') {
                setMessages(prev => [
                  ...prev,
                  { role: 'assistant', content: accumulatedMessage }
                ]);
                setCurrentMessage('');
                accumulatedMessage = '';
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            placeholder={t('askAboutCare')}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading}
            title={t('sendMessage')}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
