
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChevronRight, Activity, Heart, Moon, Brain, TrendingUp, Calendar } from 'lucide-react';
import { HealthPredictionService } from '@/services/mockServices';
import { useUser } from '@/lib/hooks/use-user';
import { SleepTracker } from './SleepTracker';

export interface WellnessDashboardProps {
  userId?: string;
}

export const WellnessDashboard: React.FC<WellnessDashboardProps> = ({ userId }) => {
  const { user } = useUser();
  const [wellnessScore, setWellnessScore] = useState<number>(0);
  const [wellnessTrends, setWellnessTrends] = useState<{date: string; score: number}[]>([]);
  const [wellnessInsights, setWellnessInsights] = useState<string[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<{id: string; title: string; progress: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWellnessData = async () => {
      try {
        const actualUserId = userId || user?.id;
        if (!actualUserId) return;

        // In a real application, this would fetch from your database
        // Using mock data here
        
        // Mock wellness score
        setWellnessScore(85);
        
        // Mock wellness trends for the past week
        setWellnessTrends([
          { date: '2023-01-01', score: 80 },
          { date: '2023-01-02', score: 82 },
          { date: '2023-01-03', score: 85 },
          { date: '2023-01-04', score: 83 },
          { date: '2023-01-05', score: 84 },
          { date: '2023-01-06', score: 86 },
          { date: '2023-01-07', score: 88 },
        ]);
        
        // Mock wellness insights
        setWellnessInsights([
          'Your sleep patterns have improved this week',
          'Try to increase your physical activity',
          'Your stress levels have decreased significantly',
        ]);
        
        // Mock wellness goals
        setWellnessGoals([
          { id: '1', title: 'Improve sleep quality', progress: 70 },
          { id: '2', title: 'Increase physical activity', progress: 40 },
          { id: '3', title: 'Reduce stress levels', progress: 60 },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wellness data:', error);
        setLoading(false);
      }
    };

    fetchWellnessData();
  }, [userId, user]);

  // Format the data for the trends chart
  const formattedTrends = wellnessTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: trend.score,
  }));

  const vitalSignsData = [
    { name: 'Resting', heart: 72, oxygen: 98 },
    { name: 'Morning', heart: 75, oxygen: 97 },
    { name: 'Afternoon', heart: 80, oxygen: 96 },
    { name: 'Evening', heart: 78, oxygen: 97 },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Wellness Dashboard</CardTitle>
            <CardDescription>Loading your wellness data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wellness Score Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Wellness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center">{wellnessScore}</div>
            <div className="text-sm text-center text-muted-foreground mt-2">
              {wellnessScore > 80 ? 'Excellent' : wellnessScore > 60 ? 'Good' : 'Needs improvement'}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View Details <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Card */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vitalSignsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" domain={[60, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="heart" name="Heart Rate" fill="#ef4444" />
                  <Bar yAxisId="right" dataKey="oxygen" name="Oxygen %" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Tracker Section */}
      <SleepTracker />

      {/* Wellness Trends Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Wellness Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wellness Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Wellness Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {wellnessInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 py-2 border-b last:border-0 text-sm">
                  <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 dark:text-purple-400 text-xs">{index + 1}</span>
                  </div>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Wellness Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Wellness Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {wellnessGoals.map((goal) => (
                <li key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{goal.title}</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
