
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface MetricValue {
  claims_submitted: number;
  claims_approved: number;
  total_cost: number;
  out_of_pocket: number;
}

export const InsuranceAnalyticsDashboard = () => {
  const { toast } = useToast();

  const { data: latestMetrics } = useQuery({
    queryKey: ['latestInsuranceMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_analytics')
        .select('metrics')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.metrics as MetricValue;
    }
  });

  const { data: historicalMetrics } = useQuery({
    queryKey: ['historicalInsuranceMetrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_analytics')
        .select('metrics, created_at')
        .order('created_at', { ascending: true })
        .limit(30);

      if (error) throw error;
      
      return data?.map(record => ({
        ...record.metrics,
        date: new Date(record.created_at).toLocaleDateString()
      }));
    }
  });

  if (!latestMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insurance Analytics</CardTitle>
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
        <CardTitle>Insurance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <p className="text-sm font-medium">Claims Submitted</p>
            <p className="text-2xl font-bold">{latestMetrics.claims_submitted}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Claims Approved</p>
            <p className="text-2xl font-bold">{latestMetrics.claims_approved}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Total Cost</p>
            <p className="text-2xl font-bold">${latestMetrics.total_cost.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Out of Pocket</p>
            <p className="text-2xl font-bold">${latestMetrics.out_of_pocket.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_cost" stroke="#8884d8" name="Total Cost" />
              <Line type="monotone" dataKey="out_of_pocket" stroke="#82ca9d" name="Out of Pocket" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
