import { Link, useNavigate } from "react-router-dom";
import { ButtonPrimary } from "../ui/button-primary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LanguageSelector } from "../ui/language-selector";
import { useTranslation } from "react-i18next";
import { Home, Users, MessageSquare, Heart, Settings, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t("error"),
        description: t("signOutError"),
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const navItems = [
    { icon: Home, label: t("home"), path: "/" },
    { icon: Users, label: t("careGroups"), path: "/groups" },
    { icon: Heart, label: t("moodSupport"), path: "/mood-support" },
    { icon: MessageSquare, label: t("messages"), path: "/messages" },
    { icon: Settings, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="text-primary text-xl font-bold"
              >
                {t("appName")}
              </motion.span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        location.pathname === item.path
                          ? "bg-primary-100 text-primary"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                </motion.button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Avatar>
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback>
                          {userProfile?.first_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 hidden sm:inline">
                        {t("welcome")}, {userProfile?.first_name || t("user")}
                      </span>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("signOut")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ButtonPrimary 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/auth")}
                >
                  {t("signIn")}
                </ButtonPrimary>
                <ButtonPrimary 
                  size="sm"
                  onClick={() => navigate("/auth")}
                >
                  {t("signUp")}
                </ButtonPrimary>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};