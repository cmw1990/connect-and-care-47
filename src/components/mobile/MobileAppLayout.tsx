import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  Home,
  Activity,
  Calendar,
  Users,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/hooks/use-user';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from './MobileNavigation';
import { PullToRefresh } from './MobileGestures';
import { Outlet } from 'react-router-dom';

interface MobileAppLayoutProps {
  children?: React.ReactNode;
}

export function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Health', path: '/health' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: Users, label: 'Care Team', path: '/care-team' },
  ];

  const isActive = (path: string) => router.pathname === path;

  const handleRefresh = async () => {
    // Implement your refresh logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
        <main className="container px-4">
          {children || <Outlet />}
        </main>
      </PullToRefresh>
    </div>
  );
}
