
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationScheduleManager } from "./MedicationScheduleManager";
import { MedicationVerificationPanel } from "./MedicationVerificationPanel";
import { MedicationInventoryManager } from "./MedicationInventoryManager";
import { MedicationReminders } from "./MedicationReminders";
import { Pills, ClipboardCheck, PackageSearch, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicationDashboardProps {
  groupId: string;
}

export const MedicationDashboard = ({ groupId }: MedicationDashboardProps) => {
  const [activeTab, setActiveTab] = useState("schedule");
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pills className="h-5 w-5" />
          Medication Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Pills className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <MedicationScheduleManager groupId={groupId} />
          </TabsContent>

          <TabsContent value="verification">
            <MedicationVerificationPanel groupId={groupId} />
          </TabsContent>

          <TabsContent value="inventory">
            <MedicationInventoryManager groupId={groupId} />
          </TabsContent>

          <TabsContent value="reminders">
            <MedicationReminders groupId={groupId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
