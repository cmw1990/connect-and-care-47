
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Video, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickAction {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  description: string;
  gradient: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Schedule Check-in",
      icon: Calendar,
      onClick: () => navigate("/groups"),
      color: "text-blue-500",
      description: "Plan your next care check-in",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      title: "Team Chat",
      icon: MessageSquare,
      onClick: () => navigate("/messages"),
      color: "text-green-500",
      description: "Communicate with care team",
      gradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Video Call",
      icon: Video,
      onClick: () => navigate("/groups"),
      color: "text-purple-500",
      description: "Start a video consultation",
      gradient: "from-purple-50 to-pink-50"
    },
    {
      title: "Care Guides",
      icon: Heart,
      onClick: () => navigate("/care-guides"),
      color: "text-red-500",
      description: "Access care instructions",
      gradient: "from-red-50 to-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-br ${action.gradient}`}
              onClick={action.onClick}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className={`${action.color} bg-white p-3 rounded-full w-fit shadow-sm`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between hover:translate-x-1 transition-transform"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
