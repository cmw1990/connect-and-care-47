
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface CareMetricsProps {
  groupId: string;
}

export const CareMetrics = ({ groupId }: CareMetricsProps) => {
  const { t } = useTranslation();

  const { data: metrics } = useQuery({
    queryKey: ['careMetrics', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_quality_metrics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('careQuality')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="recorded_at" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="metric_value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
