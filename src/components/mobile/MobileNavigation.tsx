import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Dialog } from '@capacitor/dialog';
import {
  Home,
  Calendar,
  Users,
  Activity,
  Menu,
  Bell,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/lib/hooks/use-user';

// Native-like page transitions
const pageTransitions = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '-100%' },
};

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [showMenu, setShowMenu] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Initialize native features
  React.useEffect(() => {
    const setupNativeFeatures = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });

        // Handle hardware back button
        App.addListener('backButton', async ({ canGoBack }) => {
          if (canGoBack) {
            navigate(-1);
          } else {
            const { value } = await Dialog.confirm({
              title: 'Exit App',
              message: 'Are you sure you want to exit?',
              okButtonTitle: 'Exit',
              cancelButtonTitle: 'Cancel',
            });

            if (value) {
              App.exitApp();
            }
          }
        });
      } catch (error) {
        console.error('Error setting up native features:', error);
      }
    };

    setupNativeFeatures();
  }, [navigate]);

  const handleNavigation = async (path: string) => {
    try {
      // Add haptic feedback
      await Haptics.impact({ style: ImpactStyle.Light });
      navigate(path);
    } catch (error) {
      console.error('Error with haptic feedback:', error);
      navigate(path);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: Users, label: 'Care Team', path: '/care-team' },
    { icon: Activity, label: 'Health', path: '/health' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-background/80 backdrop-blur-lg border-b flex items-center justify-between px-4">
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <ScrollArea className="h-full">
              <div className="space-y-6 py-4">
                <div className="px-4 space-y-2">
                  <h2 className="text-lg font-semibold">
                    {user?.name || 'Welcome'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your care settings and preferences
                  </p>
                </div>
                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/profile')}
                  >
                    Profile Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/notifications')}
                  >
                    Notifications
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/devices')}
                  >
                    Connected Devices
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigation('/privacy')}
                  >
                    Privacy & Security
                  </Button>
                </nav>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="flex-1 text-center font-semibold truncate">
          Care Companion
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 relative"
          onClick={() => handleNavigation('/notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-[10px] font-medium rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Main Content Area with Native-like Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitions}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="pt-12 pb-16"
        >
          {/* Page content goes here */}
        </motion.main>
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-t grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                'h-full rounded-none flex flex-col items-center justify-center gap-1',
                isActive && 'text-primary border-t-2 border-primary'
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </>
  );
}
