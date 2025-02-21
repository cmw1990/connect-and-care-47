import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, FileUp, Image } from 'lucide-react';
import { careTeamService } from '@/lib/supabase/care-team-service';
import type { CareTeamMessage } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CareTeamChatProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareTeamChat({ teamId, onError }: CareTeamChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = React.useState<CareTeamMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const loadMessages = React.useCallback(async () => {
    try {
      const messages = await careTeamService.getTeamMessages(teamId);
      setMessages(messages);
    } catch (error) {
      onError(error as Error);
    }
  }, [teamId, onError]);

  React.useEffect(() => {
    loadMessages();

    const subscription = careTeamService.subscribeToMessages(teamId, (payload) => {
      loadMessages();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [teamId, loadMessages]);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await careTeamService.sendTeamMessage({
        teamId,
        senderId: user.id,
        messageType: 'text',
        content: newMessage.trim(),
        readBy: [user.id],
      });
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

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.senderId === user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://avatar.vercel.sh/${message.senderId}`} />
                <AvatarFallback>
                  {message.senderId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(message.createdAt).toLocaleTimeString()}
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
