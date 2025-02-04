import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CareHomeMetric } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const CareHomeManagement = ({ facilityId }: { facilityId: string }) => {
  const [metrics, setMetrics] = useState<CareHomeMetric[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('care_home_metrics')
          .select('*')
          .eq('facility_id', facilityId)
          .order('recorded_at', { ascending: true });

        if (error) throw error;
        setMetrics(data as CareHomeMetric[]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast({
          title: "Error",
          description: "Failed to load facility metrics",
          variant: "destructive",
        });
      }
    };

    fetchMetrics();
  }, [facilityId, toast]);

  const addMetric = async (metricData: Omit<CareHomeMetric, 'id' | 'recorded_at'>) => {
    try {
      const { error } = await supabase
        .from('care_home_metrics')
        .insert([metricData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric added successfully",
      });
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Facility Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="metric_value" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};