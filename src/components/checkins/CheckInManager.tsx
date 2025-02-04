import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar, Clock, Activity, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { notificationService } from "@/services/NotificationService";
import { Tables } from "@/integrations/supabase/types";

type PatientCheckIn = Tables<"patient_check_ins">;

interface CheckInSettings {
  dailyCheckIn: boolean;
  checkInTime: string;
  customQuestions: string[];
  activityMonitoring: boolean;
  inactivityThreshold: number;
  medicationReminders: boolean;
  emergencyContacts: boolean;
}

export const CheckInManager = ({ groupId }: { groupId: string }) => {
  const [settings, setSettings] = useState<CheckInSettings>({
    dailyCheckIn: true,
    checkInTime: "09:00",
    customQuestions: ["How are you feeling today?", "Did you take your medications?", "Did you eat well today?"],
    activityMonitoring: true,
    inactivityThreshold: 12,
    medicationReminders: true,
    emergencyContacts: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCheckIns();
    subscribeToCheckIns();
  }, [groupId]);

  const subscribeToCheckIns = () => {
    const channel = supabase
      .channel('check-ins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_check_ins',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Check-in update:', payload);
          fetchCheckIns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_check_ins')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast({
        title: "Error",
        description: "Failed to load check-ins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleCheckIn = async () => {
    try {
      const { error } = await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'daily',
          scheduled_time: new Date().toISOString(),
          response_data: {
            questions: settings.customQuestions,
          },
        });

      if (error) throw error;

      await notificationService.scheduleLocalNotification(
        "Daily Check-in",
        "Time for your daily check-in. How are you doing today?",
        new Date(settings.checkInTime)
      );

      toast({
        title: "Success",
        description: "Check-in scheduled successfully",
      });
    } catch (error) {
      console.error('Error scheduling check-in:', error);
      toast({
        title: "Error",
        description: "Failed to schedule check-in",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyAlert = async () => {
    try {
      const { error } = await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'emergency',
          status: 'urgent',
          scheduled_time: new Date().toISOString(),
          response_data: {
            type: 'emergency_alert',
            triggered_at: new Date().toISOString(),
          },
        });

      if (error) throw error;

      toast({
        title: "Emergency Alert Sent",
        description: "Emergency contacts will be notified immediately",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daily Check-ins</CardTitle>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline">Configure</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check-in Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailyCheckIn">Daily Check-in</Label>
                    <Switch
                      id="dailyCheckIn"
                      checked={settings.dailyCheckIn}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, dailyCheckIn: checked })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={settings.checkInTime}
                      onChange={(e) =>
                        setSettings({ ...settings, checkInTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Custom Questions</Label>
                    <Textarea
                      value={settings.customQuestions.join("\n")}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          customQuestions: e.target.value.split("\n"),
                        })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="activityMonitoring">Activity Monitoring</Label>
                    <Switch
                      id="activityMonitoring"
                      checked={settings.activityMonitoring}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, activityMonitoring: checked })
                      }
                    />
                  </div>
                  <Button onClick={() => setIsEditing(false)}>Save Settings</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className="flex items-center"
              onClick={scheduleCheckIn}
              disabled={!settings.dailyCheckIn}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Check-in
            </Button>
            <Button
              variant="destructive"
              className="flex items-center"
              onClick={handleEmergencyAlert}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency Alert
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Recent Check-ins</h3>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : checkIns.length > 0 ? (
              <div className="space-y-2">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="p-3 border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {checkIn.check_in_type === 'daily' ? (
                        <Clock className="h-4 w-4 mr-2" />
                      ) : checkIn.check_in_type === 'emergency' ? (
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      ) : (
                        <Activity className="h-4 w-4 mr-2" />
                      )}
                      <div>
                        <p className="font-medium">
                          {checkIn.check_in_type.charAt(0).toUpperCase() +
                            checkIn.check_in_type.slice(1)}{' '}
                          Check-in
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(checkIn.created_at),
                            'MMM d, yyyy h:mm a'
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        checkIn.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : checkIn.status === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {checkIn.status.charAt(0).toUpperCase() +
                        checkIn.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No recent check-ins</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};