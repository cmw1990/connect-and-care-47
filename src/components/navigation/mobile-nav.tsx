
import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const MobileNav = () => {
  const location = useLocation();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("home"), path: "/" },
    { icon: Users, label: t("careGroups"), path: "/groups" },
    { icon: Heart, label: t("moodSupport"), path: "/mood-support" },
    {
      icon: MessageSquare,
      label: t("messages"),
      path: "/messages",
      badge: hasUnreadMessages,
    },
    { icon: Menu, label: t("more"), path: "/more" },
  ];

  useEffect(() => {
    const checkUnreadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('public:team_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'team_messages'
          },
          (payload) => {
            if (payload.new.sender_id !== user.id) {
              setHasUnreadMessages(true);
              toast({
                title: t("newMessage"),
                description: t("newMessageInGroup"),
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUnreadMessages();
  }, [toast, t]);

  const handleMessageClick = () => {
    setHasUnreadMessages(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-lg">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={item.path === "/messages" ? handleMessageClick : undefined}
              className="w-full"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 space-y-1 relative rounded-lg mx-1",
                  location.pathname === item.path
                    ? "bg-primary-100 text-primary-600 font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
