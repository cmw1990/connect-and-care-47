import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Heart, Brain, Sun } from "lucide-react";

interface CareQualityMetricsProps {
  groupId: string;
}

export const CareQualityMetrics = ({ groupId }: CareQualityMetricsProps) => {
  const [metrics, setMetrics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, [groupId]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('care_quality_metrics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setMetrics(data?.metric_value || null);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load care quality metrics",
        variant: "destructive",
      });
    }
  };

  const metricItems = [
    { icon: Heart, label: "Physical Health", value: metrics?.physical || 0, color: "text-red-500" },
    { icon: Brain, label: "Mental Health", value: metrics?.mental || 0, color: "text-blue-500" },
    { icon: Sun, label: "Mood", value: metrics?.mood || 0, color: "text-yellow-500" },
    { icon: Activity, label: "Activity", value: metrics?.activity || 0, color: "text-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              <Progress value={item.value} className="h-2" />
              <span className="text-sm text-muted-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};