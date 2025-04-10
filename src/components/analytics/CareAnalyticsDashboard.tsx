
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";

interface CareMetric {
  id: string;
  recorded_at: string;
  metric_value: {
    care_quality: number;
    task_completion: number;
    medication_adherence: number;
  };
}

interface CareAnalyticsDashboardProps {
  groupId: string;
}

export function CareAnalyticsDashboard({ groupId }: CareAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<CareMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, [groupId]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Mock data for development
      const mockMetrics: CareMetric[] = Array.from({ length: 10 }, (_, i) => ({
        id: `metric-${i}`,
        recorded_at: new Date(Date.now() - i * 86400000).toISOString(), // Daily data points
        metric_value: {
          care_quality: 70 + Math.floor(Math.random() * 20),
          task_completion: 65 + Math.floor(Math.random() * 30),
          medication_adherence: 80 + Math.floor(Math.random() * 20),
        }
      }));
      
      setMetrics(mockMetrics.reverse()); // Most recent first
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format data for the chart
  const chartData = metrics.map(metric => ({
    date: new Date(metric.recorded_at).toLocaleDateString(),
    'Care Quality': metric.metric_value.care_quality,
    'Task Completion': metric.metric_value.task_completion,
    'Medication Adherence': metric.metric_value.medication_adherence,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-6">
            <div className="h-80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Care Quality" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Task Completion" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="Medication Adherence" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Object.entries({
                'Care Quality': metrics.length > 0 ? metrics[metrics.length - 1].metric_value.care_quality : 0,
                'Task Completion': metrics.length > 0 ? metrics[metrics.length - 1].metric_value.task_completion : 0,
                'Medication Adherence': metrics.length > 0 ? metrics[metrics.length - 1].metric_value.medication_adherence : 0,
              }).map(([label, value]) => (
                <div key={label} className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-medium">{label}</h3>
                  <p className="text-2xl font-bold">{value}%</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="trends" className="pt-6">
            <p className="text-muted-foreground">Detailed trend analysis will be available soon.</p>
          </TabsContent>
          <TabsContent value="reports" className="pt-6">
            <p className="text-muted-foreground">Generate and download detailed reports coming soon.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
