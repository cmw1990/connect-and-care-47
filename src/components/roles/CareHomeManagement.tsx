import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Users, Package, AlertTriangle } from "lucide-react";

interface CareHomeMetric {
  id: string;
  facility_id: string;
  metric_type: string;
  metric_value: {
    occupancy: number;
    staffing: {
      ratio: number;
      present: number;
      total: number;
    };
    resources: {
      utilization: number;
      lowStock: string[];
    };
    metrics: {
      quality: number;
      incidents: number;
    };
  };
  recorded_at: string;
}

export const CareHomeManagement = ({ facilityId }: { facilityId: string }) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['care-home-metrics', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_home_metrics')
        .select('*')
        .eq('facility_id', facilityId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as CareHomeMetric;
    },
  });

  const analyzeMetrics = async () => {
    try {
      setIsAnalyzing(true);
      const response = await supabase.functions.invoke('care-home-management', {
        body: {
          facilityId,
          action: 'analyze',
          data: metrics?.metric_value
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Analysis Complete",
        description: "Facility metrics have been analyzed successfully.",
      });

      const { error: updateError } = await supabase
        .from('care_home_metrics')
        .insert({
          facility_id: facilityId,
          metric_type: 'analysis',
          metric_value: response.data
        });

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error analyzing metrics:', error);
      toast({
        title: "Error",
        description: "Failed to analyze facility metrics",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div>Loading facility metrics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metric_value.occupancy}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Staff-to-Patient Ratio
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:{metrics?.metric_value.staffing.ratio}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resource Utilization
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metric_value.resources.utilization}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quality Score
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.metric_value.metrics.quality}/10</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy Rate (%)</Label>
                <Input
                  id="occupancy"
                  type="number"
                  placeholder="Enter occupancy rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffRatio">Staff Ratio</Label>
                <Input
                  id="staffRatio"
                  type="number"
                  placeholder="Enter staff-to-patient ratio"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resourceUtilization">Resource Utilization (%)</Label>
                <Input
                  id="resourceUtilization"
                  type="number"
                  placeholder="Enter resource utilization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualityScore">Quality Score</Label>
                <Input
                  id="qualityScore"
                  type="number"
                  placeholder="Enter quality score"
                />
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={analyzeMetrics}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Metrics"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};