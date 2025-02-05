import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Brain, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WellnessTrackerProps {
  groupId: string;
}

export const WellnessTracker = ({ groupId }: WellnessTrackerProps) => {
  const [wellnessData, setWellnessData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWellnessData();
  }, [groupId]);

  const fetchWellnessData = async () => {
    try {
      const { data, error } = await supabase
        .from('care_analytics')
        .select('*')
        .eq('group_id', groupId)
        .eq('metric_type', 'wellness')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setWellnessData(data?.metric_value || {
        physical: 'N/A',
        mental: 'N/A',
        mood: 'N/A',
        activity: 'N/A'
      });
    } catch (error) {
      console.error('Error fetching wellness data:', error);
      toast({
        title: "Error",
        description: "Unable to load wellness data. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const metrics = [
    { icon: Heart, label: "Physical Health", value: wellnessData?.physical || "N/A", color: "text-red-500" },
    { icon: Brain, label: "Mental Health", value: wellnessData?.mental || "N/A", color: "text-blue-500" },
    { icon: Sun, label: "Mood", value: wellnessData?.mood || "N/A", color: "text-yellow-500" },
    { icon: Activity, label: "Activity", value: wellnessData?.activity || "N/A", color: "text-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-4 border rounded-lg">
              <metric.icon className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
              <h3 className="text-sm font-medium">{metric.label}</h3>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};