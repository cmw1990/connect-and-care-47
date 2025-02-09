
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicationScheduleManager } from "./MedicationScheduleManager";
import { MedicationVerificationPanel } from "./MedicationVerificationPanel";
import { MedicationInventoryManager } from "./MedicationInventoryManager";
import { MedicationReminders } from "./MedicationReminders";
import { Pill, ClipboardCheck, PackageSearch, Bell, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MedicationDashboardProps {
  groupId: string;
}

export const MedicationDashboard = ({ groupId }: MedicationDashboardProps) => {
  const [activeTab, setActiveTab] = useState("schedule");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch group details for context
  const { data: groupDetails } = useQuery({
    queryKey: ['groupDetails', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_groups')
        .select(`
          *,
          care_recipients:care_group_members(
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Check user's role in the group
  const { data: userRole } = useQuery({
    queryKey: ['userRole', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('care_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.role;
    }
  });

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate(`/groups/${groupId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Group
        </Button>
        
        {/* Context Info */}
        {groupDetails && (
          <div className="text-sm text-muted-foreground">
            Managing medications for {groupDetails.name}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            <CardTitle>Medication Management</CardTitle>
          </div>
          {userRole === 'admin' && (
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('inventory')}
              className="hidden sm:flex items-center gap-2"
            >
              <PackageSearch className="h-4 w-4" />
              Manage Inventory
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              {userRole && ['admin', 'caregiver'].includes(userRole) && (
                <TabsTrigger value="verification" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Verification
                </TabsTrigger>
              )}
              {userRole === 'admin' && (
                <TabsTrigger value="inventory" className="flex items-center gap-2 sm:hidden">
                  <PackageSearch className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
              )}
              <TabsTrigger value="reminders" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <MedicationScheduleManager groupId={groupId} userRole={userRole} />
            </TabsContent>

            {userRole && ['admin', 'caregiver'].includes(userRole) && (
              <TabsContent value="verification">
                <MedicationVerificationPanel groupId={groupId} />
              </TabsContent>
            )}

            {userRole === 'admin' && (
              <TabsContent value="inventory">
                <MedicationInventoryManager groupId={groupId} />
              </TabsContent>
            )}

            <TabsContent value="reminders">
              <MedicationReminders groupId={groupId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
