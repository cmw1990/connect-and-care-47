
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";

// Mock service
const HealthPredictionService = {
  analyzeHealthData: async (userId: string) => {
    return {
      sleep: { quality: 85, avgHours: 7.5 },
      activity: { level: 'moderate', minutes: 45 },
      nutrition: { quality: 70, hydration: 'adequate' }
    };
  },
  assessHealthRisks: async (userId: string) => {
    return {
      fallRisk: 'low',
      cognitiveDeclineRisk: 'moderate',
      recommendations: ['Regular sleep schedule', 'Daily cognitive exercises']
    };
  },
  analyzeHealthTrends: async (userId: string) => {
    return {
      sleep: [
        { month: 'Jan', quality: 60 },
        { month: 'Feb', quality: 65 },
        { month: 'Mar', quality: 75 },
        { month: 'Apr', quality: 80 },
        { month: 'May', quality: 85 }
      ],
      mood: [
        { month: 'Jan', score: 65 },
        { month: 'Feb', score: 70 },
        { month: 'Mar', score: 68 },
        { month: 'Apr', score: 75 },
        { month: 'May', score: 80 }
      ]
    };
  },
  generatePersonalizedRecommendations: async (userId: string) => {
    return [
      { category: 'Exercise', recommendation: 'Consider adding 10 minutes of gentle stretching in the morning' },
      { category: 'Nutrition', recommendation: 'Increase water intake by 500ml daily' },
      { category: 'Cognitive', recommendation: 'Daily word puzzles to maintain mental acuity' }
    ];
  }
};

interface HealthAnalyticsDashboardProps {
  userId: string;
}

export function HealthAnalyticsDashboard({ userId }: HealthAnalyticsDashboardProps) {
  const [healthData, setHealthData] = useState<any>(null);
  const [healthRisks, setHealthRisks] = useState<any>(null);
  const [healthTrends, setHealthTrends] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setIsLoading(true);
        const [data, risks, trends, recs] = await Promise.all([
          HealthPredictionService.analyzeHealthData(userId),
          HealthPredictionService.assessHealthRisks(userId),
          HealthPredictionService.analyzeHealthTrends(userId),
          HealthPredictionService.generatePersonalizedRecommendations(userId)
        ]);
        
        setHealthData(data);
        setHealthRisks(risks);
        setHealthTrends(trends);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching health analytics:', error);
        toast({
          title: "Error",
          description: "Failed to load health analytics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHealthData();
  }, [userId, toast]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-muted rounded-md"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-muted rounded-md"></div>
                  <div className="h-24 bg-muted rounded-md"></div>
                  <div className="h-24 bg-muted rounded-md"></div>
                </div>
              </div>
            ) : healthData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Sleep Quality</h3>
                        <div className="mt-2 text-3xl font-bold">{healthData.sleep.quality}%</div>
                        <p className="text-sm text-muted-foreground">Avg. {healthData.sleep.avgHours} hours</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Activity Level</h3>
                        <div className="mt-2 text-3xl font-bold capitalize">{healthData.activity.level}</div>
                        <p className="text-sm text-muted-foreground">{healthData.activity.minutes} min/day</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Nutrition</h3>
                        <div className="mt-2 text-3xl font-bold">{healthData.nutrition.quality}%</div>
                        <p className="text-sm text-muted-foreground">Hydration: {healthData.nutrition.hydration}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No health data available</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="trends" className="pt-6">
            {isLoading ? (
              <div className="animate-pulse h-80 bg-muted rounded-md"></div>
            ) : healthTrends ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthTrends.sleep}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quality" name="Sleep Quality" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="risks" className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-muted rounded-md"></div>
                <div className="h-20 bg-muted rounded-md"></div>
              </div>
            ) : healthRisks ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Fall Risk</h3>
                        <p className="text-sm text-muted-foreground">Based on movement patterns and living environment</p>
                      </div>
                      <div className="text-lg font-bold capitalize">{healthRisks.fallRisk}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Cognitive Decline Risk</h3>
                        <p className="text-sm text-muted-foreground">Based on cognitive exercises and social interactions</p>
                      </div>
                      <div className="text-lg font-bold capitalize">{healthRisks.cognitiveDeclineRisk}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No risk assessment available</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="recommendations" className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-muted rounded-md"></div>
                <div className="h-20 bg-muted rounded-md"></div>
                <div className="h-20 bg-muted rounded-md"></div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium">{rec.category}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
