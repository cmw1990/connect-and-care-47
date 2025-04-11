
import React, { useState, useEffect, useRef } from 'react';
import { createMockUserProfile, createMockMessages } from '@/utils/mockDataHelper';
import { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

interface DirectMessageChatProps {
  recipientId: string;
  onSendMessage?: (message: string) => void;
}

export const DirectMessageChat: React.FC<DirectMessageChatProps> = ({ 
  recipientId, 
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipientName, setRecipientName] = useState<string>("Care Recipient");
  
  // Simulate a current user
  const user = {
    id: "user-1",
    first_name: "John",
    last_name: "Doe"
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Use mock message data instead of supabase query
        setMessages(createMockMessages(5));
        
        // Simulate loading recipient info
        setTimeout(() => {
          setRecipientName("Jane Smith");
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (recipientId) {
      fetchMessages();
    }
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage;
    setNewMessage("");

    // Call optional callback if provided
    if (onSendMessage) {
      onSendMessage(messageContent);
    }

    // Create a temporary message to show immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name
      },
      role: "user"
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // In a real app, this would be sent to the database
      console.log("Message sent:", messageContent);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Chat with {recipientName}</CardTitle>
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
