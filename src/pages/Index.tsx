import React from "react";
import { useNavigate } from "react-router-dom";
import { UpcomingSchedule } from "@/components/schedule/UpcomingSchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Calendar, 
  Users, 
  Bell, 
  Activity,
  ClipboardCheck,
  MessageSquare,
  Heart,
  Video
} from "lucide-react";
import { AnimatedCareGuide } from "@/components/guides/AnimatedCareGuide";
import { PatientCheckIn } from "@/components/checkins/PatientCheckIn";
import { CareTeamPresence } from "@/components/groups/CareTeamPresence";
import { WellnessTracker } from "@/components/wellness/WellnessTracker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user's primary care group
  const { data: primaryGroup } = useQuery({
    queryKey: ['primaryCareGroup'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: group } = await supabase
        .from('care_group_members')
        .select('group_id, care_groups(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      return group?.care_groups;
    }
  });

  const quickActions = [
    {
      title: "Schedule Check-in",
      icon: Calendar,
      onClick: () => navigate("/groups"),
      color: "text-blue-500"
    },
    {
      title: "Team Chat",
      icon: MessageSquare,
      onClick: () => navigate("/messages"),
      color: "text-green-500"
    },
    {
      title: "Video Call",
      icon: Video,
      onClick: () => navigate("/groups"),
      color: "text-purple-500"
    },
    {
      title: "Care Guides",
      icon: Heart,
      onClick: () => navigate("/care-guides"),
      color: "text-red-500"
    }
  ];

  const handleGenerateClick = () => {
    navigate('/care-guides');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Care Companion</h1>
          <p className="text-gray-600 mt-2">Your comprehensive care management platform</p>
        </div>
        <Button 
          onClick={handleGenerateClick}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="mr-2 h-4 w-4" />
          Generate Care Guides
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={action.onClick}
          >
            <CardContent className="p-4 text-center">
              <action.icon className={`h-6 w-6 mb-2 mx-auto ${action.color}`} />
              <p className="text-sm font-medium">{action.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Care Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="checkin">Check-in</TabsTrigger>
                <TabsTrigger value="team">Care Team</TabsTrigger>
                <TabsTrigger value="wellness" className="hidden lg:block">Wellness</TabsTrigger>
                <TabsTrigger value="tasks" className="hidden lg:block">Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule">
                <UpcomingSchedule />
              </TabsContent>
              
              <TabsContent value="checkin">
                {primaryGroup?.id ? (
                  <PatientCheckIn groupId={primaryGroup.id} />
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Join a care group to access check-ins
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="team">
                {primaryGroup?.id ? (
                  <CareTeamPresence groupId={primaryGroup.id} />
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Join a care group to see team members
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="wellness">
                {primaryGroup?.id ? (
                  <WellnessTracker groupId={primaryGroup.id} />
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Join a care group to track wellness
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Today's Tasks</h3>
                    <Button variant="outline" size="sm" onClick={() => navigate('/groups')}>
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                  {/* Task list would go here */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Care Guide Examples</h2>
        <div className="grid grid-cols-1 gap-6">
          {[
            {
              disease: "Alzheimer's Disease",
              description: "Early stage care and management techniques",
              guidelines: [
                "Establish consistent daily routines",
                "Create a safe environment",
                "Use clear, simple communication",
                "Encourage social interaction",
                "Monitor medication schedule"
              ]
            },
            {
              disease: "Diabetes Type 2",
              description: "Daily monitoring and lifestyle adjustments",
              guidelines: [
                "Check blood sugar regularly",
                "Follow meal schedule",
                "Take medications as prescribed",
                "Exercise moderately",
                "Monitor foot health"
              ]
            },
            {
              disease: "Parkinson's Disease",
              description: "Movement assistance and safety precautions",
              guidelines: [
                "Practice balance exercises",
                "Take medications on time",
                "Make home modifications",
                "Attend physical therapy",
                "Monitor symptoms"
              ]
            }
          ].map((example, index) => (
            <AnimatedCareGuide
              key={index}
              disease={example.disease}
              description={example.description}
              guidelines={example.guidelines}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;