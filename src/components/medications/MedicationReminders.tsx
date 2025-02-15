import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";
import type { 
  MedicationPortalSettings,
  MedicationScheduleBase,
} from "@/types/medication";

interface MedicationRemindersProps {
  groupId: string;
}

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
  const { data: settings } = useQuery({
    queryKey: ['portal-settings', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;

      return data || {
        reminder_preferences: {
          voice_reminders: false,
          preferred_channels: [],
        },
        accessibility_settings: {
          voice_reminders: false,
        }
      };
    }
  });

  const overdueQuery = useQuery({
    queryKey: ['overduemedications', groupId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('medication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'overdue');

      if (error) throw error;
      return count ?? 0;
    }
  });

  const schedulesQuery = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('id, medication_name, dosage, time_of_day, group_id')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    }
  });

  if (settings?.reminder_preferences === undefined || settings?.accessibility_settings === undefined) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg text-destructive">
        Error loading settings
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settings === undefined || overdueQuery.isLoading || schedulesQuery.isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <OverdueAlert overdueCount={overdueQuery.data ?? 0} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <ReminderSettings 
              settings={settings} 
              groupId={groupId} 
            />
            <UpcomingReminders 
              schedules={schedulesQuery.data ?? []} 
            />
          </div>
        </>
      )}
    </div>
  );
};
