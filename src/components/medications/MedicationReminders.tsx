
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";
import type { 
  MedicationPortalSettings,
  MedicationScheduleBase,
  MedicationReminderPreferences,
  MedicationAccessibilitySettings
} from "@/types/medication";

interface MedicationRemindersProps {
  groupId: string;
}

const DEFAULT_REMINDER_PREFERENCES: MedicationReminderPreferences = {
  preferred_channels: []
};

const DEFAULT_ACCESSIBILITY_SETTINGS: MedicationAccessibilitySettings = {
  voice_reminders: false
};

const DEFAULT_SETTINGS: MedicationPortalSettings = {
  id: '',
  group_id: '',
  reminder_preferences: DEFAULT_REMINDER_PREFERENCES,
  accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS
};

const validatePreferences = (data: unknown): MedicationReminderPreferences => {
  if (!data || typeof data !== 'object') {
    return DEFAULT_REMINDER_PREFERENCES;
  }
  const pref = data as Record<string, unknown>;
  return {
    preferred_channels: Array.isArray(pref.preferred_channels) ? pref.preferred_channels.map(String) : []
  };
};

const validateAccessibility = (data: unknown): MedicationAccessibilitySettings => {
  if (!data || typeof data !== 'object') {
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
  const settings = data as Record<string, unknown>;
  return {
    voice_reminders: Boolean(settings.voice_reminders)
  };
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
    .single();

  if (error) throw error;
  
  if (!data) {
    return { ...DEFAULT_SETTINGS, group_id: groupId };
  }

  return {
    id: data.id || '',
    group_id: data.group_id,
    reminder_preferences: validatePreferences(data.reminder_preferences),
    accessibility_settings: validateAccessibility(data.accessibility_settings),
    created_at: data.created_at,
    updated_at: data.updated_at
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

const fetchMedicationSchedules = async (groupId: string): Promise<MedicationScheduleBase[]> => {
  const { data, error } = await supabase
    .from('medication_schedules')
    .select('id, medication_name, dosage, time_of_day, group_id')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
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
