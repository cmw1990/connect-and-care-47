import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  ChartBar,
  Heart,
  BookOpen,
  Building2,
  Users2,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  FileText,
  Smile,
} from "lucide-react";

export const More = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: ChartBar,
      label: "Care Comparison",
      description: "Compare care facilities and products",
      route: "/compare",
      color: "text-blue-500",
    },
    {
      icon: Smile,
      label: "Mood Support",
      description: "Track and manage your emotional wellbeing",
      route: "/mood-support",
      color: "text-green-500",
    },
    {
      icon: BookOpen,
      label: "Care Guides",
      description: "Access helpful caregiving resources",
      route: "/care-guides",
      color: "text-purple-500",
    },
    {
      icon: Building2,
      label: "Facilities Directory",
      description: "Find and review care facilities",
      route: "/facilities",
      color: "text-orange-500",
    },
    {
      icon: Users2,
      label: "Community",
      description: "Connect with other caregivers",
      route: "/community",
      color: "text-pink-500",
    },
    {
      icon: Calendar,
      label: "Schedule",
      description: "Manage care schedules and reminders",
      route: "/schedule",
      color: "text-indigo-500",
    },
    {
      icon: MessageSquare,
      label: "Support Chat",
      description: "Get help from care professionals",
      route: "/support-chat",
      color: "text-teal-500",
    },
    {
      icon: FileText,
      label: "Documents",
      description: "Store and manage important files",
      route: "/documents",
      color: "text-amber-500",
    },
    {
      icon: Heart,
      label: "Wellness Center",
      description: "Resources for caregiver wellness",
      route: "/wellness",
      color: "text-red-500",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get assistance and answers",
      route: "/help",
      color: "text-gray-500",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Manage your preferences",
      route: "/settings",
      color: "text-slate-500",
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">More Options</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card
            key={item.route}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(item.route)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg bg-gray-50 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default More;