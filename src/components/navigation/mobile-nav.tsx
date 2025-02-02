import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MobileNav = () => {
  const location = useLocation();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const checkUnreadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new messages
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
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUnreadMessages();
  }, []);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Users,
      label: "Groups",
      path: "/groups",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/messages",
      badge: hasUnreadMessages,
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
    },
    {
      icon: Menu,
      label: "More",
      path: "/more",
    },
  ];

  const handleMessageClick = () => {
    setHasUnreadMessages(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={item.path === "/messages" ? handleMessageClick : undefined}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
              location.pathname === item.path
                ? "text-primary"
                : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.badge && (
              <span className="absolute top-2 right-1/3 h-2 w-2 bg-red-500 rounded-full" />
            )}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};