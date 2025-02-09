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
  Settings,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicationRemindersProps {
  groupId: string;
}

interface ReminderPreferences {
  preferred_channels: string[];
}

interface AccessibilitySettings {
  voice_reminders: boolean;
}

interface DatabasePortalSettings {
  id?: string;
  user_id?: string;
  reminder_preferences: ReminderPreferences;
  accessibility_settings: AccessibilitySettings;
  created_at?: string;
  updated_at?: string;
}

interface PortalSettings {
  reminder_preferences: ReminderPreferences;  
  accessibility_settings: AccessibilitySettings;
}

interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
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
      return data as DatabasePortalSettings | null;
    }
  });

  const settings: PortalSettings = dbSettings ? {
    reminder_preferences: dbSettings.reminder_preferences || defaultSettings.reminder_preferences,
    accessibility_settings: dbSettings.accessibility_settings || defaultSettings.accessibility_settings
  } : defaultSettings;

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
    refetchInterval: 60000
  });

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      return data as MedicationSchedule[];
    }
  });

  const updateSettings = async (updates: Partial<PortalSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to update settings.",
          variant: "destructive",
        });
        return;
      }

      const sanitizedUpdates: Partial<DatabasePortalSettings> = {
        reminder_preferences: updates.reminder_preferences,
        accessibility_settings: updates.accessibility_settings
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
          {overdueCount > 0 && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>You have {overdueCount} overdue medication{overdueCount > 1 ? 's' : ''}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {}}
                className="hover:scale-105 transition-transform"
              >
                View Details
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <Settings className="h-4 w-4" />
                  Reminder Preferences
                </h4>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group">
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
                      className="group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex items-center justify-between group">
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
                      className="group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex items-center justify-between group">
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
                      className="group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4" />
                  Upcoming Reminders
                </h4>

                <div className="space-y-4">
                  {!schedules?.length ? (
                    <p className="text-muted-foreground text-center py-4">
                      No upcoming medication reminders
                    </p>
                  ) : (
                    schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between pb-4 border-b last:border-0 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
                      >
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {schedule.medication_name}
                          </p>
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
