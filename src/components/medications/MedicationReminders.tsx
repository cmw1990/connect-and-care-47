
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { Loader2 } from "lucide-react";
import { OverdueAlert } from "./components/OverdueAlert";  
import { ReminderSettings } from "./components/ReminderSettings";
import { UpcomingReminders } from "./components/UpcomingReminders";

interface MedicationRemindersProps {
  groupId: string;
}

// Database response types
interface RawDBSettings {
  id: string;
  user_id: string;
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
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<PortalSettings>({
    queryKey: ['portal-settings', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return defaultSettings;

      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return defaultSettings;

      const rawSettings = data as RawDBSettings;
      
      // Transform response to expected format
      return {
        reminder_preferences: {
          preferred_channels: rawSettings.reminder_preferences?.preferred_channels || []
        },
        accessibility_settings: {
          voice_reminders: rawSettings.accessibility_settings?.voice_reminders || false
        }
      };
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
              settings={settings || defaultSettings} 
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
