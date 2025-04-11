
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, FileUp, Image } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { Message, UserProfile } from '@/types/chat';
import { createMockProfile, mockCurrentUser } from '@/utils/supabaseHelpers';

interface CareTeamChatProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareTeamChat({ teamId, onError }: CareTeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Simulate a real-time subscription for messages
    const interval = setInterval(() => {
      console.log("Checking for new messages...");
    }, 10000);

    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      // Mock data for development
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Good morning team! John had a restful night.',
          sender_id: 'caregiver-123',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            first_name: 'Amy',
            last_name: 'Caregiver'
          }
        },
        {
          id: '2',
          content: 'That\'s great to hear. Has he taken his morning medication?',
          sender_id: 'professional-789',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          sender: {
            first_name: 'Dr.',
            last_name: 'Smith'
          }
        },
        {
          id: '3',
          content: 'Yes, all medications administered on schedule. He\'s having breakfast now.',
          sender_id: 'caregiver-123',
          created_at: new Date(Date.now() - 2400000).toISOString(),
          sender: {
            first_name: 'Amy',
            last_name: 'Caregiver'
          }
        },
        {
          id: '4',
          content: 'I\'ll be visiting this afternoon around 3 PM.',
          sender_id: 'family-456',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender: {
            first_name: 'Jane',
            last_name: 'Family'
          }
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      onError(error as Error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Create new message locally
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        sender_id: mockCurrentUser.id,
        created_at: new Date().toISOString(),
        sender: {
          first_name: mockCurrentUser.first_name,
          last_name: mockCurrentUser.last_name
        }
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      toast({
        title: "Message sent",
        description: "Your message has been delivered to the care team."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      onError(error as Error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSenderInitials = (sender: UserProfile | undefined) => {
    if (!sender) return 'UN';
    return `${sender.first_name.charAt(0)}${sender.last_name.charAt(0)}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender_id === mockCurrentUser.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://avatar.vercel.sh/${message.sender_id}`} />
                <AvatarFallback>
                  {getSenderInitials(message.sender)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === mockCurrentUser.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <FileUp className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Image className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
