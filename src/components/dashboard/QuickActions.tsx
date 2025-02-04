import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Video, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  description: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Schedule Check-in",
      icon: Calendar,
      onClick: () => navigate("/groups"),
      color: "text-blue-500",
      description: "Plan your next care check-in"
    },
    {
      title: "Team Chat",
      icon: MessageSquare,
      onClick: () => navigate("/messages"),
      color: "text-green-500",
      description: "Communicate with care team"
    },
    {
      title: "Video Call",
      icon: Video,
      onClick: () => navigate("/groups"),
      color: "text-purple-500",
      description: "Start a video consultation"
    },
    {
      title: "Care Guides",
      icon: Heart,
      onClick: () => navigate("/care-guides"),
      color: "text-red-500",
      description: "Access care instructions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {quickActions.map((action, index) => (
        <Card 
          key={index}
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={action.onClick}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <action.icon className={`h-8 w-8 ${action.color} group-hover:scale-110 transition-transform`} />
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};