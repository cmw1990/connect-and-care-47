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
      // First verify access using care_group_members
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership, error: membershipError } = await supabase
        .from('care_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        throw new Error('Not authorized to view metrics');
      }

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
