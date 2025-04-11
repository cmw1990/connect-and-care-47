
import React, { useState, useEffect, useRef } from 'react';
import { createMockMessages } from '@/utils/mockDataHelper';
import { useUser } from '@/lib/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { castQueryResult } from '@/utils/supabaseHelpers';
import { Message, UserProfile } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

export interface CareTeamChatProps {
  teamId: string;
  onError: (error: Error) => void;
}

export const CareTeamChat: React.FC<CareTeamChatProps> = ({ teamId, onError }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Instead of using Supabase query, use mock messages
        setMessages(createMockMessages(5));
      } catch (error) {
        onError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId) {
      fetchMessages();
    }

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `group_id=eq.${teamId}` },
        (payload) => {
          const newMsg = payload.new as unknown as Message;
          if (newMsg.sender_id) {
            // Simulate getting sender profile
            newMsg.sender = { first_name: "New", last_name: "Message" };
            setMessages(prev => [...prev, newMsg]);
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, onError]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    const message: Omit<Message, 'id' | 'created_at'> = {
      content: newMessage,
      sender_id: user.id,
      sender: { first_name: user.first_name, last_name: user.last_name },
    };

    setNewMessage("");

    try {
      // Add message locally for immediate feedback
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        ...message,
        id: tempId,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempMessage]);

      // Simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, this would be a Supabase insert
      // For now, just update the UI to show success
      console.log("Message sent:", message);

    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === user?.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div className="font-semibold text-xs">
                  {message.sender?.first_name} {message.sender?.last_name}
                </div>
                <div>{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
