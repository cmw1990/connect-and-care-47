
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  Video, 
  Heart, 
  ArrowRight, 
  Activity,
  Brain,
  Pill,
  UserCog,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  description: string;
  gradient: string;
  category: 'care' | 'health' | 'communication' | 'emergency';
  notification?: number;
}

export const QuickActions = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    {
      title: "Schedule Check-in",
      icon: Calendar,
      onClick: () => navigate("/groups"),
      color: "text-blue-500",
      description: "Plan your next care check-in",
      gradient: "from-blue-50 to-indigo-50",
      category: 'care'
    },
    {
      title: "Team Chat",
      icon: MessageSquare,
      onClick: () => navigate("/messages"),
      color: "text-green-500",
      description: "Communicate with care team",
      gradient: "from-green-50 to-emerald-50",
      category: 'communication',
      notification: 3
    },
    {
      title: "Video Call",
      icon: Video,
      onClick: () => navigate("/groups"),
      color: "text-purple-500",
      description: "Start a video consultation",
      gradient: "from-purple-50 to-pink-50",
      category: 'communication'
    },
    {
      title: "Care Guides",
      icon: Heart,
      onClick: () => navigate("/care-guides"),
      color: "text-red-500",
      description: "Access care instructions",
      gradient: "from-red-50 to-orange-50",
      category: 'care'
    },
    {
      title: "Vitals Tracker",
      icon: Activity,
      onClick: () => navigate("/vitals"),
      color: "text-cyan-500",
      description: "Monitor health metrics",
      gradient: "from-cyan-50 to-blue-50",
      category: 'health'
    },
    {
      title: "Cognitive Exercises",
      icon: Brain,
      onClick: () => navigate("/exercises"),
      color: "text-indigo-500",
      description: "Brain training activities",
      gradient: "from-indigo-50 to-violet-50",
      category: 'health'
    },
    {
      title: "Medication Manager",
      icon: Pill,
      onClick: () => navigate("/medications"),
      color: "text-amber-500",
      description: "Track medications & doses",
      gradient: "from-amber-50 to-yellow-50",
      category: 'health'
    },
    {
      title: "Caregiver Settings",
      icon: UserCog,
      onClick: () => navigate("/settings"),
      color: "text-slate-500",
      description: "Manage care preferences",
      gradient: "from-slate-50 to-gray-50",
      category: 'care'
    },
    {
      title: "Emergency SOS",
      icon: AlertCircle,
      onClick: () => navigate("/emergency"),
      color: "text-rose-500",
      description: "Quick emergency access",
      gradient: "from-rose-50 to-red-50",
      category: 'emergency'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Actions' },
    { id: 'care', label: 'Care Management' },
    { id: 'health', label: 'Health Tracking' },
    { id: 'communication', label: 'Communication' },
    { id: 'emergency', label: 'Emergency' }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="transition-all duration-200"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        layout
      >
        {filteredActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            layout
          >
            <Card 
              className={cn(
                "hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden bg-gradient-to-br",
                action.gradient,
                action.category === 'emergency' && "border-rose-200 shadow-rose-100"
              )}
              onClick={action.onClick}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`${action.color} bg-white p-3 rounded-full w-fit shadow-sm`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    {action.notification && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {action.notification}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between hover:translate-x-1 transition-transform"
                  >
                    Access Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
