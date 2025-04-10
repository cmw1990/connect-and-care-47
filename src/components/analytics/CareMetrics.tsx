
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  role: string;
  status: string;
}

interface QualityMetric {
  id: string;
  metric_value: number;
  recorded_at: string;
}

interface CareMetricsProps {
  groupId: string;
}

export function CareMetrics({ groupId }: CareMetricsProps) {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [overallQuality, setOverallQuality] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, [groupId]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockMembers: Member[] = [
        { id: '1', role: 'caregiver', status: 'active' },
        { id: '2', role: 'family', status: 'active' },
        { id: '3', role: 'professional', status: 'active' },
        { id: '4', role: 'doctor', status: 'pending' }
      ];
      
      const mockQualityMetrics: QualityMetric[] = [
        { id: '1', metric_value: 85, recorded_at: new Date().toISOString() },
        { id: '2', metric_value: 92, recorded_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', metric_value: 78, recorded_at: new Date(Date.now() - 172800000).toISOString() }
      ];
      
      setMemberCount(mockMembers.filter(m => m.status === 'active').length);
      
      const latestMetric = mockQualityMetrics.sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )[0];
      
      setOverallQuality(latestMetric?.metric_value || 0);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load care metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-10 bg-muted rounded-md" />
          ) : (
            <div className="flex items-center">
              <div className="text-3xl font-bold">{memberCount}</div>
              <div className="ml-2 text-xs font-semibold text-muted-foreground">members</div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Care Quality</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-10 bg-muted rounded-md" />
          ) : (
            <div className="flex items-center">
              <div className="text-3xl font-bold">{overallQuality}</div>
              <div className="ml-2 text-xs font-semibold text-muted-foreground">
                out of 100
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
