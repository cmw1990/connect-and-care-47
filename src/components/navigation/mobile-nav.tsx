import { Link, useLocation } from "react-router-dom";
import { Home, Users, Calendar, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const location = useLocation();

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
      icon: Heart,
      label: "Mood",
      path: "/mood-support",
    },
    {
      icon: Calendar,
      label: "Tasks",
      path: "/tasks",
    },
    {
      icon: Menu,
      label: "More",
      path: "/more",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              location.pathname === item.path
                ? "text-primary"
                : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};