import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmergencySOSButton = ({ groupId }: { groupId: string }) => {
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();

  const activateEmergency = async () => {
    try {
      setIsActivating(true);

      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Update patient location
      await supabase
        .from('patient_locations')
        .upsert({
          group_id: groupId,
          location_enabled: true,
          current_location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            last_updated: new Date().toISOString()
          }
        });

      // Create emergency check-in
      await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'emergency',
          status: 'urgent',
          response_data: {
            type: 'emergency_alert',
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            triggered_at: new Date().toISOString()
          }
        });

      toast({
        title: "Emergency Alert Sent",
        description: "Help is on the way. Stay calm.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error activating emergency:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try calling emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      className="w-full flex items-center justify-center gap-2 animate-pulse"
      onClick={activateEmergency}
      disabled={isActivating}
    >
      <AlertTriangle className="h-5 w-5" />
      {isActivating ? "Sending Alert..." : "Emergency SOS"}
    </Button>
  );
};