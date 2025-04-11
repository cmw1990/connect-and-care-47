
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, User, ArrowRightLeft, Clock } from "lucide-react";
import { createMockUserProfile, createMockMessage } from '@/utils/mockDataHelper';
import { Message, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CareTeamChatProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareTeamChat({ teamId, onError }: CareTeamChatProps) {
  // Create initial messages manually instead of using createMockMessages
  const [messages, setMessages] = useState<Message[]>([
    createMockMessage({
      content: "Good morning everyone, just wanted to update the team that Mrs. Johnson took all her medications this morning.",
      sender_id: "user-1",
      sender: createMockUserProfile({ id: "user-1", first_name: "Sarah", last_name: "Nurse" })
    }),
    createMockMessage({
      content: "Thanks for the update Sarah. How is she feeling today?",
      sender_id: "user-2",
      sender: createMockUserProfile({ id: "user-2", first_name: "Dr.", last_name: "Williams" })
    }),
    createMockMessage({
      content: "She's doing better than yesterday. Her temperature is normal today.",
      sender_id: "user-1",
      sender: createMockUserProfile({ id: "user-1", first_name: "Sarah", last_name: "Nurse" })
    })
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add message to the state
    const message = createMockMessage({
      content: newMessage,
      sender_id: "current-user",
      sender: createMockUserProfile({ id: "current-user", first_name: "You" })
    });
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Mock response after a short delay
    setTimeout(() => {
      const responseMessage = createMockMessage({
        content: "Thank you for the update. I'll note that in the patient's record.",
        sender_id: "user-2",
        sender: createMockUserProfile({ id: "user-2", first_name: "Dr.", last_name: "Williams" })
      });
      setMessages(prev => [...prev, responseMessage]);
      toast.success("New message received");
    }, 2000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <span>Team Chat</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-[calc(100%-4rem)] p-4 pt-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender_id !== 'current-user' && (
                  <div className="mr-2">
                    <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground">
                      {message.sender.first_name[0]}{message.sender.last_name[0]}
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  {message.sender_id !== 'current-user' && (
                    <span className="text-xs text-muted-foreground mb-1">
                      {message.sender.first_name} {message.sender.last_name}
                    </span>
                  )}
                  <div 
                    className={`max-w-[85%] md:max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === 'current-user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center text-xs mt-1 opacity-70">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
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
}
