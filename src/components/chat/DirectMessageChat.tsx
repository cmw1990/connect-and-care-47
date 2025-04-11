
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, User } from 'lucide-react';
import { createMockUserProfile, createMockMessage } from '@/utils/mockDataHelper';
import { Message } from '@/types';

interface DirectMessageChatProps {
  recipientId: string;
  onSendMessage: (message: string) => void;
}

export const DirectMessageChat: React.FC<DirectMessageChatProps> = ({ 
  recipientId,
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    createMockMessage({
      content: "Hello, how can I help you today?",
      sender_id: recipientId,
      sender: createMockUserProfile({ id: recipientId, first_name: "Sarah", last_name: "Johnson" })
    }),
    createMockMessage({
      content: "I had a question about the care schedule.",
      sender_id: "current-user",
      sender: createMockUserProfile({ id: "current-user", first_name: "You" })
    })
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add message to the state
    const message = createMockMessage({
      content: newMessage,
      sender_id: "current-user",
      sender: createMockUserProfile({ id: "current-user", first_name: "You" })
    });
    
    setMessages([...messages, message]);
    onSendMessage(newMessage);
    setNewMessage('');
    
    // Mock response after a short delay
    setTimeout(() => {
      const responseMessage = createMockMessage({
        content: "I've received your message. Let me check that for you.",
        sender_id: recipientId,
        sender: createMockUserProfile({ id: recipientId, first_name: "Sarah", last_name: "Johnson" })
      });
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span>Direct Message</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-[calc(100%-4rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === 'current-user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
