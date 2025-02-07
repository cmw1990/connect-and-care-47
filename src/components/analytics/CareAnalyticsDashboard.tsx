import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface MetricValue {
  physical: number;
  mental: number;
  mood: number;
  activity: number;
}

interface CareAnalyticsDashboardProps {
  groupId: string;
}

export const CareAnalyticsDashboard = ({ groupId }: CareAnalyticsDashboardProps) => {
  const { toast } = useToast();

  const { data: latestMetrics } = useQuery({
    queryKey: ['latestCareMetrics', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_analytics')
        .select('metric_value')
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

  const { data: historicalMetrics } = useQuery({
    queryKey: ['historicalCareMetrics', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_analytics')
        .select('metric_value, recorded_at')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (error) throw error;

      return data?.map(record => {
        const metricValue = record.metric_value as unknown as MetricValue;
        
        // Validate and transform each record
        if (metricValue && typeof metricValue === 'object' &&
            'physical' in metricValue &&
            'mental' in metricValue &&
            'mood' in metricValue &&
            'activity' in metricValue) {
          return {
            ...metricValue,
            date: new Date(record.recorded_at).toLocaleDateString()
          };
        }
        return null;
      }).filter(Boolean) || [];
    }
  });

  if (!latestMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="physical" stroke="#8884d8" name="Physical Health" />
              <Line type="monotone" dataKey="mental" stroke="#82ca9d" name="Mental Health" />
              <Line type="monotone" dataKey="mood" stroke="#ffc658" name="Mood" />
              <Line type="monotone" dataKey="activity" stroke="#ff7300" name="Activity Level" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};