
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

interface CareMetricsProps {
  groupId: string;
}

interface MetricData {
  id: string;
  metric_type: 'physical' | 'mental' | 'social' | 'general';
  metric_value: {
    value: number;
    notes?: string;
  };
  recorded_at: string;
  created_by: string;
}

export const CareQualityMetrics = ({ groupId }: CareMetricsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: metrics, error, isLoading } = useQuery({
    queryKey: ['careMetrics', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use the new secure function
      const { data, error } = await supabase
        .rpc('get_care_quality_metrics', {
          p_group_id: groupId
        });

      if (error) {
        console.error('Error fetching metrics:', error);
        throw error;
      }

      return data as MetricData[];
    },
    retry: 1,
    onError: (error) => {
      toast({
        title: "Error loading metrics",
        description: "Unable to load care quality metrics. Please try again later.",
        variant: "destructive",
      });
    }
  });

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('Unable to load metrics')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-[200px] bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics?.map(metric => ({
    date: new Date(metric.recorded_at).toLocaleDateString(),
    value: metric.metric_value.value,
    type: metric.metric_type
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('careQuality')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8"
                name={t('metricValue')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
