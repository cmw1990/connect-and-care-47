import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmergencyAlertProps {
  groupId: string;
}

export const EmergencyAlert = ({ groupId }: EmergencyAlertProps) => {
  const { toast } = useToast();

  const handleEmergency = async () => {
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
        description: "Help is on the way. Stay calm.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleEmergency}
    >
      <AlertTriangle className="h-5 w-5" />
      Emergency Alert
    </Button>
  );
};