
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

interface DatabasePortalSettings {
  id: string;
  group_id: string;
  reminder_preferences: {
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

const fetchPortalSettings = async (groupId: string): Promise<MedicationPortalSettings> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      id: '',
      group_id: groupId,
      reminder_preferences: {
        preferred_channels: []
      },
      accessibility_settings: {
        voice_reminders: false
      }
    };
  }

  const { data, error } = await supabase
    .from('medication_portal_settings')
    .select('*')
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) throw error;
  
  if (!data) {
    return {
      id: '',
      group_id: groupId,
      reminder_preferences: {
        preferred_channels: []
      },
      accessibility_settings: {
        voice_reminders: false
      }
    };
  }

  const settings = data as DatabasePortalSettings;
  
  return {
    id: settings.id,
    group_id: settings.group_id,
    reminder_preferences: {
      preferred_channels: settings.reminder_preferences?.preferred_channels || []
    },
    accessibility_settings: {
      voice_reminders: settings.accessibility_settings?.voice_reminders || false
    },
    created_at: settings.created_at,
    updated_at: settings.updated_at
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
