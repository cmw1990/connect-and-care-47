import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";
import type { MedicationPortalSettings, MedicationScheduleBase } from "@/types/medication";

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

      const defaultSettings = {
        reminder_preferences: {
          voice_reminders: false,
          preferred_channels: [] as string[],
        },
        accessibility_settings: {
          voice_reminders: false,
        }
      };

      if (!data) return defaultSettings;

      // Transform JSON fields if necessary
      const transformedData = {
        ...defaultSettings,
        ...data,
        reminder_preferences: typeof data.reminder_preferences === 'string' 
          ? JSON.parse(data.reminder_preferences)
          : data.reminder_preferences,
        accessibility_settings: typeof data.accessibility_settings === 'string'
          ? JSON.parse(data.accessibility_settings)
          : data.accessibility_settings
      };

      return transformedData;
    }
  });

  const schedulesQuery = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('id, medication_name, dosage, frequency, time_of_day, group_id')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MedicationScheduleBase[];
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
      {settings === undefined || schedulesQuery.isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
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
