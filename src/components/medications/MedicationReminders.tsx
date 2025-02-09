
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  Settings,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface MedicationRemindersProps {
  groupId: string;
}

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface ReminderPreferences {
  preferred_channels: string[];
}

interface AccessibilitySettings {
  voice_reminders: boolean;
}

interface DatabasePortalSettings {
  id?: string;
  user_id?: string;
  reminder_preferences: Json;
  accessibility_settings: Json;
  created_at?: string;
  updated_at?: string;
}

interface PortalSettings {
  reminder_preferences: ReminderPreferences;  
  accessibility_settings: AccessibilitySettings;
}

const defaultSettings: PortalSettings = {
  reminder_preferences: {
    preferred_channels: []
  },
  accessibility_settings: {
    voice_reminders: false
  }
};

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
  const { toast } = useToast();
  const { data: dbSettings } = useQuery({
    queryKey: ['medicationPortalSettings', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('medication_portal_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DatabasePortalSettings | null;
    }
  });

  // Convert database settings to frontend format with type assertions
  const settings: PortalSettings = dbSettings ? {
    reminder_preferences: (dbSettings.reminder_preferences as unknown as ReminderPreferences) || defaultSettings.reminder_preferences,
    accessibility_settings: (dbSettings.accessibility_settings as unknown as AccessibilitySettings) || defaultSettings.accessibility_settings
  } : defaultSettings;

  const { data: overdueCount } = useQuery({
    queryKey: ['overduemedications', groupId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('medication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('status', 'overdue');

      if (error) throw error;
      return count;
    },
    refetchInterval: 60000
  });

  const updateSettings = async (updates: Partial<PortalSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sanitizedUpdates: Partial<DatabasePortalSettings> = {
        reminder_preferences: updates.reminder_preferences as unknown as Json,
        accessibility_settings: updates.accessibility_settings as unknown as Json
      };

      if (dbSettings) {
        const { error } = await supabase
          .from('medication_portal_settings')
          .update(sanitizedUpdates)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medication_portal_settings')
          .insert([{ 
            user_id: user.id,
            ...sanitizedUpdates 
          }]);

        if (error) throw error;
      }

      toast({
        title: "Settings Updated",
        description: "Your medication reminder preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: schedules } = useQuery({
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

  return (
    <div className="space-y-4">
      {overdueCount && overdueCount > 0 && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>You have {overdueCount} overdue medication{overdueCount > 1 ? 's' : ''}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {}}
          >
            View Details
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              Reminder Preferences
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive push notifications on your devices
                  </div>
                </div>
                <Switch
                  checked={settings.reminder_preferences.preferred_channels.includes('push')}
                  onCheckedChange={(checked) => {
                    const channels = settings.reminder_preferences.preferred_channels;
                    updateSettings({
                      reminder_preferences: {
                        preferred_channels: checked
                          ? [...channels, 'push']
                          : channels.filter(c => c !== 'push')
                      }
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive text message reminders
                  </div>
                </div>
                <Switch
                  checked={settings.reminder_preferences.preferred_channels.includes('sms')}
                  onCheckedChange={(checked) => {
                    const channels = settings.reminder_preferences.preferred_channels;
                    updateSettings({
                      reminder_preferences: {
                        preferred_channels: checked
                          ? [...channels, 'sms']
                          : channels.filter(c => c !== 'sms')
                      }
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voice Reminders</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable spoken medication reminders
                  </div>
                </div>
                <Switch
                  checked={settings.accessibility_settings.voice_reminders}
                  onCheckedChange={(checked) => {
                    updateSettings({
                      accessibility_settings: {
                        voice_reminders: checked
                      }
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4" />
              Upcoming Reminders
            </h4>

            <div className="space-y-4">
              {schedules?.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between pb-4 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{schedule.medication_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.dosage}
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    {schedule.time_of_day.map((time: string) => (
                      <div key={time} className="flex items-center gap-2">
                        <BellRing className="h-4 w-4" />
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
