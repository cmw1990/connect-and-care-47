import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingSchedule } from "@/components/schedule/UpcomingSchedule";
import { PatientCheckIn } from "@/components/checkins/PatientCheckIn";
import { CareTeamPresence } from "@/components/groups/CareTeamPresence";
import { WellnessTracker } from "@/components/wellness/WellnessTracker";
import { Calendar, ClipboardCheck, Users, Activity, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CareOverviewProps {
  groupId?: string;
}

export const CareOverview = ({ groupId }: CareOverviewProps) => {
  if (!groupId) {
    return null;
  }

  return (
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
        <PatientCheckIn groupId={groupId} />
      </TabsContent>
      
      <TabsContent value="team">
        <CareTeamPresence groupId={groupId} />
      </TabsContent>
      
      <TabsContent value="wellness">
        <WellnessTracker groupId={groupId} />
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground py-4">
                No new updates
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};