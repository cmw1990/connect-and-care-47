
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '@/components/ui/button';
import { Home, User, Heart, Activity, LifeBuoy, Settings } from 'lucide-react';

export const TopNavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Heart, label: "Care Management", path: "/care-management" },
    { icon: User, label: "Care Network", path: "/care-network" },
    { icon: Activity, label: "Health", path: "/sleep" },
    { icon: LifeBuoy, label: "Support", path: "/support" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center font-bold text-xl">
            Care Companion
          </Link>
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors ${
                  isActive(item.path) ? "text-primary bg-primary/10" : "text-gray-600"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            asChild
          >
            <Link to="/auth">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
