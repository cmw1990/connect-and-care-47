
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceReminder } from "./components/VoiceReminder";
import { SupervisorPanel } from "./components/SupervisorPanel";
import { AdherenceChart } from "./components/AdherenceChart";
import { UpcomingReminders } from "./components/UpcomingReminders"; 
import { Loader2, Bell, Activity, ShieldCheck } from "lucide-react";
import type { MedicationAdherenceTrend, MedicationSupervisionSummary } from "@/types/medication";

interface Settings {
  voice_reminders: boolean;
  preferred_voice?: string;
}

interface ReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
}

export const MedicationDashboard = ({ groupId }: { groupId: string }) => {
  const { toast } = useToast();

  const { data: adherenceData, isLoading: isLoadingAdherence } = useQuery<MedicationAdherenceTrend[]>({
    queryKey: ['medicationAdherence', groupId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_adherence_trends')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: supervisorData, isLoading: isLoadingSupervisor } = useQuery<MedicationSupervisionSummary>({
    queryKey: ['medicationSupervision', groupId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_supervision_summary')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;

      const result: MedicationSupervisionSummary = {
        id: data.id,
        total_medications: data.total_medications || 0,
        pending_verifications: data.pending_verifications || 0,
        approved_medications: data.approved_medications || 0,
        missed_medications: data.missed_medications || 0,
        avg_verification_time_minutes: data.avg_verification_time_minutes || 0
      };

      return result;
    }
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['medicationSettings', groupId] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('reminder_preferences')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;
      
      const reminderPrefs = data?.reminder_preferences as unknown as ReminderPreferences;
      return {
        voice_reminders: reminderPrefs?.voice_reminders ?? false,
        preferred_voice: reminderPrefs?.preferred_voice
      };
    }
  });

  if (isLoadingAdherence || isLoadingSupervisor) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const adherenceRate = adherenceData?.[0]?.adherence_rate ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{adherenceRate}%</div>
              <Progress value={adherenceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <VoiceReminder 
              groupId={groupId} 
              settings={settings ?? { voice_reminders: false }} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervision</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {supervisorData?.pending_verifications ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending Verifications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="supervision">Supervision</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <UpcomingReminders schedules={[]} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdherenceChart data={adherenceData ?? []} />
        </TabsContent>

        <TabsContent value="supervision" className="space-y-4">
          <SupervisorPanel 
            groupId={groupId}
            supervisionData={supervisorData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
