
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";

interface MedicationRemindersProps {
  groupId: string;
}

// Settings interfaces for UI components
interface PreferredChannels {
  preferred_channels: string[];
}

interface AccessibilitySettings {
  voice_reminders: boolean;
}

interface PortalSettings {
  reminder_preferences: PreferredChannels;
  accessibility_settings: AccessibilitySettings;
}

// Raw database response type with strict typing
interface RawSettings {
  id: string;
  user_id: string;
  reminder_preferences: {
    preferred_channels?: string[];
  } | null;
  accessibility_settings: {
    voice_reminders?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

// Fixed default settings
const defaultSettings: PortalSettings = {
  reminder_preferences: {
    preferred_channels: []
  },
  accessibility_settings: {
    voice_reminders: false
  }
};

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
  // Query portal settings with improved type safety
  const { data: dbSettings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['portal-settings', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;

      // Transform raw database response to strongly typed object
      const rawData = data as RawSettings;
      return {
        reminder_preferences: {
          preferred_channels: rawData.reminder_preferences?.preferred_channels || []
        },
        accessibility_settings: {
          voice_reminders: rawData.accessibility_settings?.voice_reminders || false
        }
      } as PortalSettings;
    }
  });

  // Overdue medications count
  const { data: overdueCount = 0, isLoading: overdueLoading } = useQuery({
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
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      return data;
    }
  });

  // Use default settings if none found in DB
  const settings = dbSettings || defaultSettings;

  if (settingsError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg text-destructive">
        Error loading settings. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settingsLoading || overdueLoading || schedulesLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <OverdueAlert overdueCount={overdueCount} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <ReminderSettings 
              settings={settings} 
              groupId={groupId} 
            />
            <UpcomingReminders 
              schedules={schedules} 
            />
          </div>
        </>
      )}
    </div>
  );
};
