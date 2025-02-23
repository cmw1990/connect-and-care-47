
import { Link } from "react-router-dom";
import { Home, Users, Settings } from "lucide-react";

export function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 md:hidden">
      <div className="flex justify-around items-center">
        <Link to="/" className="flex flex-col items-center">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/care-network" className="flex flex-col items-center">
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Network</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center">
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
}
