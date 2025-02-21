import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  File,
  Image,
  Paperclip,
  Send,
  Video,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  attachments?: {
    type: "image" | "document" | "video";
    url: string;
    name: string;
  }[];
}

export function SecureChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Sample data - will be replaced with real-time Supabase subscription
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: "1",
        content: "Good morning! How did mom sleep last night?",
        sender: {
          id: "user1",
          name: "Sarah",
          avatar: "/avatars/sarah.jpg",
        },
        timestamp: new Date(),
      },
    ];
    setMessages(sampleMessages);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Will be replaced with actual Supabase insert
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: "currentUser",
        name: "You",
      },
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatars/care-group.jpg" />
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{t('chat.familyCareGroup')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('chat.onlineMembers', { count: 3 })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender.id === "currentUser"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="flex items-start space-x-2 max-w-[70%]">
                {message.sender.id !== "currentUser" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>
                      {message.sender.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  {message.sender.id !== "currentUser" && (
                    <div className="text-sm font-medium mb-1">
                      {message.sender.name}
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender.id === "currentUser"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.attachments && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            {attachment.type === "image" ? (
                              <Image className="h-4 w-4" />
                            ) : attachment.type === "video" ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <File className="h-4 w-4" />
                            )}
                            <span>{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Camera className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.typeMessage')}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
