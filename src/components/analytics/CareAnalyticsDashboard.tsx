import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Heart, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CareAnalyticsDashboard {
  groupId: string;
}

interface MetricValue {
  physical: number;
  mental: number;
  mood: number;
  activity: number;
}

export const CareAnalyticsDashboard = ({ groupId }: CareAnalyticsDashboard) => {
  const { data: analytics } = useQuery({
    queryKey: ['careAnalytics', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_analytics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Explicitly type cast the metric_value after validating its structure
      const metricValue = data?.metric_value as unknown as MetricValue;
      
      // Validate the structure matches our expected interface
      if (metricValue && typeof metricValue === 'object' &&
          'physical' in metricValue &&
          'mental' in metricValue &&
          'mood' in metricValue &&
          'activity' in metricValue) {
        return metricValue;
      }
      
      // Return null if the data doesn't match our expected structure
      return null;
    }
  });

  const metrics = [
    { icon: Heart, label: "Physical Health", value: analytics?.physical ?? 'N/A', color: "text-red-500" },
    { icon: Brain, label: "Mental Health", value: analytics?.mental ?? 'N/A', color: "text-blue-500" },
    { icon: Sun, label: "Mood", value: analytics?.mood ?? 'N/A', color: "text-yellow-500" },
    { icon: Activity, label: "Activity", value: analytics?.activity ?? 'N/A', color: "text-green-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Analytics Overview</CardTitle>
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