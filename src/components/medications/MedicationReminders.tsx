
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";
import type { MedicationSchedule } from "@/types/medication";

interface MedicationRemindersProps {
  groupId: string;
}

// Database response types
interface RawDBSettings {
  id: string;
  group_id: string;
  reminder_preferences: {
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Fixed default settings
const defaultSettings = {
  reminder_preferences: {
    preferred_channels: [] as string[]
  },
  accessibility_settings: {
    voice_reminders: false
  }
};

// Interface for processed settings
interface PortalSettings {
  reminder_preferences: {
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
}

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
  // Query portal settings
  const portalSettingsQuery = useQuery({
    queryKey: ['portal-settings', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return defaultSettings;

      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return defaultSettings;

      // Ensure type safety by explicitly constructing the return object
      return {
        reminder_preferences: {
          preferred_channels: Array.isArray(data.reminder_preferences?.preferred_channels) 
            ? data.reminder_preferences.preferred_channels 
            : defaultSettings.reminder_preferences.preferred_channels
        },
        accessibility_settings: {
          voice_reminders: typeof data.accessibility_settings?.voice_reminders === 'boolean'
            ? data.accessibility_settings.voice_reminders
            : defaultSettings.accessibility_settings.voice_reminders
        }
      } as PortalSettings;
    }
  });

  // Overdue medications count 
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
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Medication schedules 
  const schedulesQuery = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as MedicationSchedule[];
    }
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
              settings={portalSettingsQuery.data || defaultSettings} 
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
