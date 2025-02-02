import { Link, useNavigate } from "react-router-dom";
import { ButtonPrimary } from "../ui/button-primary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LanguageSelector } from "../ui/language-selector";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar = ({ children }: NavbarProps) => {
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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary text-xl font-bold">{t("appName")}</span>
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/groups"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t("careGroups")}
                </Link>
                <Link
                  to="/mood-support"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  {t("moodSupport")}
                </Link>
                <Link
                  to="/tasks"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t("tasks")}
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t("messages")}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {children}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {t("welcome")}, {userProfile?.first_name || t("user")}
                </span>
                <ButtonPrimary variant="outline" size="sm" onClick={handleSignOut}>
                  {t("signOut")}
                </ButtonPrimary>
              </div>
            ) : (
              <>
                <ButtonPrimary 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => navigate("/auth")}
                >
                  {t("signIn")}
                </ButtonPrimary>
                <ButtonPrimary 
                  size="sm"
                  onClick={() => {
                    navigate("/auth");
                  }}
                >
                  {t("signUp")}
                </ButtonPrimary>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};