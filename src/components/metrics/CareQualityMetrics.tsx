import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Brain, ThumbsUp } from "lucide-react";

interface CareQualityMetric {
  id: string;
  group_id: string;
  metric_type: string;
  metric_value: {
    value: number;
    category: string;
    timestamp: string;
  };
  recorded_at: string;
  notes?: string;
}

interface MetricCategory {
  name: string;
  icon: React.ElementType;
  key: string;
  description: string;
}

const metricCategories: MetricCategory[] = [
  {
    name: "Patient Satisfaction",
    icon: ThumbsUp,
    key: "satisfaction",
    description: "Overall satisfaction with care quality"
  },
  {
    name: "Care Plan Adherence",
    icon: Activity,
    key: "adherence",
    description: "Percentage of care plan tasks completed"
  },
  {
    name: "Health Outcomes",
    icon: Heart,
    key: "outcomes",
    description: "Improvement in health indicators"
  },
  {
    name: "Quality of Life",
    icon: Brain,
    key: "quality_of_life",
    description: "Overall wellbeing assessment"
  }
];

export const CareQualityMetrics = ({ groupId }: { groupId: string }) => {
  const [metrics, setMetrics] = useState<CareQualityMetric[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("satisfaction");
  const [newValue, setNewValue] = useState<string>("");
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
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our expected type
      const transformedData = (data || []).map(item => ({
        ...item,
        metric_value: typeof item.metric_value === 'string' 
          ? JSON.parse(item.metric_value)
          : item.metric_value
      })) as CareQualityMetric[];

      setMetrics(transformedData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load care quality metrics",
        variant: "destructive",
      });
    }
  };

  const addMetric = async () => {
    if (!newValue || isNaN(Number(newValue))) {
      toast({
        title: "Error",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('care_quality_metrics')
        .insert({
          group_id: groupId,
          metric_type: selectedCategory,
          metric_value: {
            value: Number(newValue),
            category: selectedCategory,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metric added successfully",
      });

      setNewValue("");
      fetchMetrics();
    } catch (error) {
      console.error('Error adding metric:', error);
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      });
    }
  };

  const getChartData = () => {
    return metrics
      .filter(m => m.metric_type === selectedCategory)
      .map(m => ({
        timestamp: new Date(m.recorded_at).toLocaleDateString(),
        value: m.metric_value.value
      }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricCategories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => setSelectedCategory(category.key)}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label>Add New Metric Value (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <Button 
              className="self-end"
              onClick={addMetric}
            >
              Add Metric
            </Button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};