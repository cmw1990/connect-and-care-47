
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Heart, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();

  // Hide the mobile navigation on the landing page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/") && location.pathname === "/" ? "text-primary" : "text-muted-foreground"
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
          to="/support"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/support") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LifeBuoy className="h-5 w-5" />
          <span className="text-xs mt-1">Support</span>
        </Link>
        <Link
          to="/settings"
          className={cn(
            "flex flex-col items-center justify-center flex-1 pt-1",
            isActive("/settings") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
};
