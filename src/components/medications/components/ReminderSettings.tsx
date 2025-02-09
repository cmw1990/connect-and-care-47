
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReminderSettingsProps {
  settings: {
    reminder_preferences: {
      preferred_channels: string[];
    };
    accessibility_settings: {
      voice_reminders: boolean;
    };
  };
  groupId: string;
}

export const ReminderSettings = ({ settings, groupId }: ReminderSettingsProps) => {
  const { toast } = useToast();

  const updateSettings = async (updates: Partial<typeof settings>) => {
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

      const { error } = await supabase
        .from('medication_portal_settings')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;

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

  return (
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
                  },
                  accessibility_settings: settings.accessibility_settings
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
                  },
                  accessibility_settings: settings.accessibility_settings
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
                  reminder_preferences: settings.reminder_preferences,
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
  );
};
