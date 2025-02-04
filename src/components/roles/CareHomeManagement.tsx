import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CareHomeMetric } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const CareHomeManagement = ({ facilityId }: { facilityId: string }) => {
  const [metrics, setMetrics] = useState<CareHomeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMetric, setNewMetric] = useState({
    metric_type: "occupancy",
    metric_value: 0
  });
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
        
        const typedMetrics: CareHomeMetric[] = data.map(item => ({
          id: item.id,
          facility_id: item.facility_id,
          metric_type: item.metric_type,
          metric_value: item.metric_value,
          recorded_at: item.recorded_at
        }));
        
        setMetrics(typedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast({
          title: "Error",
          description: "Failed to load facility metrics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [facilityId, toast]);

  const addMetric = async () => {
    try {
      const metricData = {
        facility_id: facilityId,
        metric_type: newMetric.metric_type,
        metric_value: newMetric.metric_value,
        recorded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('care_home_metrics')
        .insert([metricData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric added successfully",
      });

      // Refresh metrics
      const { data, error: fetchError } = await supabase
        .from('care_home_metrics')
        .select('*')
        .eq('facility_id', facilityId)
        .order('recorded_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMetrics(data as CareHomeMetric[]);
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  const analyzeMetrics = async () => {
    try {
      const response = await supabase.functions.invoke('care-home-management', {
        body: {
          facilityId,
          action: 'analyze',
          data: {
            metrics: metrics.reduce((acc, metric) => {
              acc[metric.metric_type] = metric.metric_value;
              return acc;
            }, {} as Record<string, any>)
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Analysis Complete",
        description: "Check the analytics dashboard for results",
      });
    } catch (error) {
      console.error('Error analyzing metrics:', error);
      toast({
        title: "Error",
        description: "Failed to analyze metrics",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Facility Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              value={newMetric.metric_type}
              onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                <SelectItem value="staff_ratio">Staff-to-Patient Ratio</SelectItem>
                <SelectItem value="satisfaction">Patient Satisfaction</SelectItem>
                <SelectItem value="incidents">Incident Rate</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Metric value"
              value={newMetric.metric_value}
              onChange={(e) => setNewMetric(prev => ({ ...prev, metric_value: parseFloat(e.target.value) }))}
            />
            <Button onClick={addMetric} className="md:col-span-2">Add Metric</Button>
          </div>

          {metrics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No metrics available</p>
          ) : (
            <>
              <div className="h-[300px] mb-4">
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
              <Button onClick={analyzeMetrics} variant="outline" className="w-full">
                Analyze Metrics
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};