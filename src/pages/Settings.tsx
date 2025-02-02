import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  moodCheckReminder: boolean;
  taskReminders: boolean;
  groupActivity: boolean;
  caregiverUpdates: boolean;
  dailyInsights: boolean;
  medicationReminders: boolean;
  appointmentAlerts: boolean;
  wellnessNotifications: boolean;
}

export default function Settings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    moodCheckReminder: true,
    taskReminders: true,
    groupActivity: true,
    caregiverUpdates: true,
    dailyInsights: true,
    medicationReminders: true,
    appointmentAlerts: true,
    wellnessNotifications: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
    subscribeToNotifications();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data?.notification_preferences) {
        const prefs = data.notification_preferences as Record<string, boolean>;
        setPreferences(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(prefs).filter(([key]) => key in prev)
          )
        }));
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    }
  };

  const subscribeToNotifications = () => {
    // Subscribe to group posts
    const channel = supabase
      .channel('public:group_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_posts'
        },
        (payload) => {
          if (preferences.groupActivity) {
            toast({
              title: "New Group Post",
              description: "Someone posted in your care group",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex flex-col">
                <span className="font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="text-sm text-gray-500">
                  Receive notifications about {key.toLowerCase()}
                </span>
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => 
                  updatePreference(key as keyof NotificationPreferences, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}