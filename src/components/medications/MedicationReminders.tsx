
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

interface MedicationRemindersProps {
  groupId: string;
}

export const MedicationReminders = ({ groupId }: MedicationRemindersProps) => {
  const { data: settings } = useQuery({
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
      return data;
    }
  });

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

  const updateSettings = async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (settings) {
      const { error } = await supabase
        .from('medication_portal_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) console.error('Error updating settings:', error);
    } else {
      const { error } = await supabase
        .from('medication_portal_settings')
        .insert([{ user_id: user.id, ...updates }]);

      if (error) console.error('Error creating settings:', error);
    }
  };

  return (
    <div className="space-y-4">
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
                  checked={settings?.reminder_preferences?.preferred_channels?.includes('push')}
                  onCheckedChange={(checked) => {
                    const channels = settings?.reminder_preferences?.preferred_channels || [];
                    updateSettings({
                      reminder_preferences: {
                        ...settings?.reminder_preferences,
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
                  checked={settings?.reminder_preferences?.preferred_channels?.includes('sms')}
                  onCheckedChange={(checked) => {
                    const channels = settings?.reminder_preferences?.preferred_channels || [];
                    updateSettings({
                      reminder_preferences: {
                        ...settings?.reminder_preferences,
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
                  checked={settings?.accessibility_settings?.voice_reminders}
                  onCheckedChange={(checked) => {
                    updateSettings({
                      accessibility_settings: {
                        ...settings?.accessibility_settings,
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
