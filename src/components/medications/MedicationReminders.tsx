
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";
import type { MedicationSchedule, MedicationPortalSettings } from "@/types/medication";

interface MedicationRemindersProps {
  groupId: string;
}

type DatabaseReminderPreferences = {
  preferred_channels: string[];
};

type DatabaseAccessibilitySettings = {
  voice_reminders: boolean;
};

interface DatabasePortalSettings {
  id: string;
  group_id: string;
  reminder_preferences: DatabaseReminderPreferences;
  accessibility_settings: DatabaseAccessibilitySettings;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: MedicationPortalSettings = {
  id: '',
  group_id: '',
  reminder_preferences: {
    preferred_channels: []
  },
  accessibility_settings: {
    voice_reminders: false
  }
};

const fetchPortalSettings = async (groupId: string): Promise<MedicationPortalSettings> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ...DEFAULT_SETTINGS, group_id: groupId };
  }

  const { data, error } = await supabase
    .from('medication_portal_settings')
    .select('*')
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) throw error;
  
  if (!data) {
    return { ...DEFAULT_SETTINGS, group_id: groupId };
  }

  // Type assertion with runtime validation
  const dbSettings = data as unknown as DatabasePortalSettings;
  
  return {
    id: dbSettings.id || '',
    group_id: dbSettings.group_id,
    reminder_preferences: {
      preferred_channels: Array.isArray(dbSettings.reminder_preferences?.preferred_channels) 
        ? dbSettings.reminder_preferences.preferred_channels 
        : []
    },
    accessibility_settings: {
      voice_reminders: typeof dbSettings.accessibility_settings?.voice_reminders === 'boolean'
        ? dbSettings.accessibility_settings.voice_reminders
        : false
    },
    created_at: dbSettings.created_at,
    updated_at: dbSettings.updated_at
  };
};

const fetchOverdueCount = async (groupId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('medication_logs')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('status', 'overdue');

  if (error) throw error;
  return count ?? 0;
};

const fetchMedicationSchedules = async (groupId: string): Promise<MedicationSchedule[]> => {
  const { data, error } = await supabase
    .from('medication_schedules')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const MedicationReminders: React.FC<MedicationRemindersProps> = ({ groupId }) => {
  const portalSettingsQuery = useQuery({
    queryKey: ['portal-settings', groupId],
    queryFn: () => fetchPortalSettings(groupId)
  });

  const overdueQuery = useQuery({
    queryKey: ['overduemedications', groupId],
    queryFn: () => fetchOverdueCount(groupId)
  });

  const schedulesQuery = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: () => fetchMedicationSchedules(groupId)
  });

  if (portalSettingsQuery.error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg text-destructive">
        Error loading settings: {portalSettingsQuery.error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portalSettingsQuery.isLoading || overdueQuery.isLoading || schedulesQuery.isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <OverdueAlert overdueCount={overdueQuery.data ?? 0} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <ReminderSettings 
              settings={portalSettingsQuery.data!} 
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
