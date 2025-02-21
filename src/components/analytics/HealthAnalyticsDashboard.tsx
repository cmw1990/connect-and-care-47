import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { healthPredictionService } from '@/lib/ai/health-prediction-service';
import { useUser } from '@/lib/hooks/use-user';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, Heart } from 'lucide-react';

export function HealthAnalyticsDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [predictions, setPredictions] = React.useState<any>(null);
  const [risks, setRisks] = React.useState<any[]>([]);
  const [trends, setTrends] = React.useState<any[]>([]);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadAnalytics = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [predictionsData, risksData, trendsData, recommendationsData] = await Promise.all([
        healthPredictionService.analyzeHealthData(user.id),
        healthPredictionService.assessHealthRisks(user.id),
        healthPredictionService.analyzeHealthTrends(user.id),
        healthPredictionService.generatePersonalizedRecommendations(user.id),
      ]);

      setPredictions(predictionsData);
      setRisks(risksData);
      setTrends(trendsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please sign in to view health analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading analytics...</p>
          <Progress value={33} className="mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="risks">Health Risks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(predictions?.confidence * 100)}%
                </div>
                <Progress
                  value={predictions?.confidence * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {risks.slice(0, 3).map((risk, index) => (
                    <Badge
                      key={index}
                      variant={
                        risk.level === 'high'
                          ? 'destructive'
                          : risk.level === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {risk.type}: {risk.level}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.slice(0, 3).map((trend, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge
                        variant={
                          trend.trend === 'improving'
                            ? 'default'
                            : trend.trend === 'stable'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {trend.metric}
                      </Badge>
                      <span className="text-sm">{trend.trend}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI Health Predictions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Primary Prediction</h4>
                    <p className="text-muted-foreground">{predictions?.prediction}</p>
                  </div>

                  <div>
                    <h4 className="font-medium">Contributing Factors</h4>
                    <ul className="list-disc list-inside mt-2">
                      {predictions?.factors.map((factor: string, index: number) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="list-disc list-inside mt-2">
                      {predictions?.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Health Risk Assessment</h3>
                <div className="grid gap-4">
                  {risks.map((risk, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{risk.type}</h4>
                          <Badge
                            variant={
                              risk.level === 'high'
                                ? 'destructive'
                                : risk.level === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {risk.level} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {risk.description}
                        </p>
                        <div>
                          <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                          <ul className="list-disc list-inside text-sm">
                            {risk.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Health Trends Analysis</h3>
                <div className="grid gap-4">
                  {trends.map((trend, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{trend.metric}</h4>
                          <Badge
                            variant={
                              trend.trend === 'improving'
                                ? 'default'
                                : trend.trend === 'stable'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {trend.trend}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {trend.analysis}
                        </p>
                        <div>
                          <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                          <ul className="list-disc list-inside text-sm">
                            {trend.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
