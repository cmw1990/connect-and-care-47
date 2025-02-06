
import { Bell, Calendar, Search, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WellnessScore } from "./WellnessScore";

interface DashboardHeaderProps {
  notifications?: any[];
  groupId?: string;
}

export const DashboardHeader = ({ notifications, groupId }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const navigateToNotifications = () => navigate('/notifications');
  const navigateToAppointments = () => navigate('/appointments');
  const navigateToSearch = () => navigate('/search');

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Care Companion</h1>
        <p className="text-gray-600 mt-2">Your comprehensive care management platform</p>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={navigateToNotifications}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {notifications?.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={navigateToAppointments}
        >
          <Calendar className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={navigateToSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
        <WellnessScore groupId={groupId} />
        <Button 
          onClick={() => navigate('/care-guides')}
          className="bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
        >
          <Play className="mr-2 h-4 w-4" />
          Generate Care Guides
        </Button>
      </div>
    </div>
  );
};
