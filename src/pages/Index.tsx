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
  MessageSquare,
  Heart,
  Video,
  Activity,
  ClipboardCheck,
  Users,
  Bell
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

  // Fetch user's primary care group with improved error handling
  const { data: primaryGroup, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['primaryCareGroup'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your care group",
          variant: "destructive",
        });
        return null;
      }

      const { data: group, error } = await supabase
        .from('care_group_members')
        .select('group_id, care_groups(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching care group:', error);
        toast({
          title: "Error",
          description: "Failed to load care group information",
          variant: "destructive",
        });
      }

      return group?.care_groups;
    }
  });

  const quickActions = [
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

  if (isLoadingGroup) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Care Companion</h1>
          <p className="text-gray-600 mt-2">Your comprehensive care management platform</p>
        </div>
        <Button 
          onClick={() => navigate('/care-guides')}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="mr-2 h-4 w-4" />
          Generate Care Guides
        </Button>
      </div>

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

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Care Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="checkin" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Check-in
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Care Team
              </TabsTrigger>
              <TabsTrigger value="wellness" className="hidden lg:flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Wellness
              </TabsTrigger>
              <TabsTrigger value="notifications" className="hidden lg:flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Updates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule">
              <UpcomingSchedule />
            </TabsContent>
            
            <TabsContent value="checkin">
              {primaryGroup?.id ? (
                <PatientCheckIn groupId={primaryGroup.id} />
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Care Group Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Join a care group to access check-ins and other features
                  </p>
                  <Button onClick={() => navigate('/groups')}>
                    Find or Create a Care Group
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="team">
              {primaryGroup?.id ? (
                <CareTeamPresence groupId={primaryGroup.id} />
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Join a care group to see team members
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="wellness">
              {primaryGroup?.id ? (
                <WellnessTracker groupId={primaryGroup.id} />
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Join a care group to track wellness
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* We'll implement real-time notifications here */}
                    <p className="text-center text-muted-foreground py-4">
                      No new updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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