
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Heart, Activity, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-white shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/care-network"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/care-network") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Network</span>
        </Link>
        <Link
          to="/care-management"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/care-management") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Care</span>
        </Link>
        <Link
          to="/sleep"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/sleep") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Activity className="h-5 w-5" />
          <span className="text-xs mt-1">Health</span>
        </Link>
        <Link
          to="/support"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/support") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LifeBuoy className="h-5 w-5" />
          <span className="text-xs mt-1">Support</span>
        </Link>
      </div>
    </div>
  );
};
