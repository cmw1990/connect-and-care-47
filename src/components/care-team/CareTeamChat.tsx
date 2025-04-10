
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, FileUp, Image } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/hooks/use-user';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface CareTeamChatProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareTeamChat({ teamId, onError }: CareTeamChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock data for development
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Good morning team! John had a restful night.',
        sender_id: 'caregiver-123',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        content: 'That\'s great to hear. Has he taken his morning medication?',
        sender_id: 'professional-789',
        created_at: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: '3',
        content: 'Yes, all medications administered on schedule. He\'s having breakfast now.',
        sender_id: 'caregiver-123',
        created_at: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: '4',
        content: 'I\'ll be visiting this afternoon around 3 PM.',
        sender_id: 'family-456',
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    
    setMessages(mockMessages);
  }, [teamId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!user || !newMessage.trim()) return;

    try {
      // Create new message locally for now
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSenderInitials = (senderId: string) => {
    if (senderId === 'caregiver-123') return 'CG';
    if (senderId === 'professional-789') return 'PR';
    if (senderId === 'family-456') return 'FM';
    return senderId.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender_id === user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://avatar.vercel.sh/${message.sender_id}`} />
                <AvatarFallback>
                  {getSenderInitials(message.sender_id)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user?.id
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
