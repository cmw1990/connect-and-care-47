
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

interface VerificationSettings {
  require_photo: boolean;
  require_double_verification: boolean;
  verification_window_minutes: number;
  reminder_threshold_minutes: number;
}

export const MedicationVerificationSettings = ({ groupId }: { groupId: string }) => {
  const [settings, setSettings] = useState<VerificationSettings>({
    require_photo: true,
    require_double_verification: false,
    verification_window_minutes: 30,
    reminder_threshold_minutes: 15
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, [groupId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_verification_settings')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('medication_verification_settings')
        .upsert({
          group_id: groupId,
          ...settings
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Verification settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Verification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="require_photo">Require Photo Verification</Label>
          <Switch
            id="require_photo"
            checked={settings.require_photo}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, require_photo: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="require_double_verification">Require Double Verification</Label>
          <Switch
            id="require_double_verification"
            checked={settings.require_double_verification}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, require_double_verification: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification_window">Verification Window (minutes)</Label>
          <Input
            id="verification_window"
            type="number"
            value={settings.verification_window_minutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                verification_window_minutes: parseInt(e.target.value)
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_threshold">Reminder Threshold (minutes)</Label>
          <Input
            id="reminder_threshold"
            type="number"
            value={settings.reminder_threshold_minutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                reminder_threshold_minutes: parseInt(e.target.value)
              })
            }
          />
        </div>

        <Button 
          className="w-full" 
          onClick={updateSettings}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
