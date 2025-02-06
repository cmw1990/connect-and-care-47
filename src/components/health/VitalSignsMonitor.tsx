
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Thermometer, Wind } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  oxygen_level?: number;
}

export const VitalSignsMonitor = ({ groupId }: { groupId: string }) => {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchVitalSigns = async () => {
      const { data, error } = await supabase
        .from('medical_device_data')
        .select('readings')
        .eq('group_id', groupId)
        .eq('device_type', 'vital_signs')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching vital signs:', error);
        return;
      }

      if (data?.readings) {
        setVitalSigns(data.readings as VitalSigns);
        checkVitalSigns(data.readings as VitalSigns);
      }
    };

    fetchVitalSigns();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('medical-device-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'medical_device_data',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          if (payload.new.device_type === 'vital_signs') {
            setVitalSigns(payload.new.readings as VitalSigns);
            checkVitalSigns(payload.new.readings as VitalSigns);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const checkVitalSigns = (vitals: VitalSigns) => {
    if (vitals.heart_rate && (vitals.heart_rate < 60 || vitals.heart_rate > 100)) {
      toast({
        title: "Abnormal Heart Rate",
        description: `Current heart rate: ${vitals.heart_rate} BPM`,
        variant: "destructive",
      });
    }

    if (vitals.oxygen_level && vitals.oxygen_level < 95) {
      toast({
        title: "Low Oxygen Level",
        description: `Current oxygen level: ${vitals.oxygen_level}%`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Vital Signs Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Heart className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-sm font-medium">Blood Pressure</span>
            <span className="text-2xl font-bold">{vitalSigns.blood_pressure || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Activity className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium">Heart Rate</span>
            <span className="text-2xl font-bold">{vitalSigns.heart_rate || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Thermometer className="h-8 w-8 text-yellow-500 mb-2" />
            <span className="text-sm font-medium">Temperature</span>
            <span className="text-2xl font-bold">{vitalSigns.temperature || 'N/A'}°F</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Wind className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium">Oxygen Level</span>
            <span className="text-2xl font-bold">{vitalSigns.oxygen_level || 'N/A'}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
