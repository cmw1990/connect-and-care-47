import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, User } from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export const CareAssistant = ({ groupId }: { groupId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = input;
      setInput('');
      
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

      // Get context about the care situation if groupId is provided
      let context = "No specific care context provided.";
      if (groupId) {
        const { data: patientInfo } = await supabase
          .from('patient_info')
          .select('*')
          .eq('group_id', groupId)
          .maybeSingle();

        if (patientInfo) {
          context = `Patient Information:
          Medical Conditions: ${patientInfo.diseases?.join(', ') || 'None specified'}
          Care Tips: ${patientInfo.care_tips?.join(', ') || 'None specified'}`;
        }
      }

      // Call the AI assistant
      const response = await fetch('/functions/v1/care-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ message: userMessage, context }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <Button onClick={sendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};