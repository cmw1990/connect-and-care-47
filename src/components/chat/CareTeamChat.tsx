
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const CareTeamChat = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    const channel = subscribeToMessages();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("team_messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          sender:profiles!team_messages_sender_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel("team_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          fetchMessages();
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("team_messages").insert({
        group_id: groupId,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Care Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
