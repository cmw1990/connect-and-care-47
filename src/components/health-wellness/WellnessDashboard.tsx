import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { healthService } from '@/lib/supabase/health-service';
import { useTranslation } from 'react-i18next';
import { SleepTracker } from './SleepTracker';
import { ActivityTracker } from './ActivityTracker';
import { MoodSupport } from '@/pages/MoodSupport';
import { MedicationManager } from './MedicationManager';
import { SymptomTracker } from './SymptomTracker';
import { VitalSignsMonitor } from '../health/VitalSignsMonitor';
import {
  Heart,
  Brain,
  Activity,
  Moon,
  Pill,
  Thermometer,
  Smile,
  BarChart4,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

interface WellnessScore {
  overall: number;
  sleep: number;
  activity: number;
  mood: number;
  medication: number;
  vitals: number;
}

interface WellnessTrend {
  date: string;
  score: number;
}

export const WellnessDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useUser();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [wellnessScore, setWellnessScore] = React.useState<WellnessScore>({
    overall: 0,
    sleep: 0,
    activity: 0,
    mood: 0,
    medication: 0,
    vitals: 0,
  });
  const [trends, setTrends] = React.useState<WellnessTrend[]>([]);
  const [insights, setInsights] = React.useState<string[]>([]);
  const [goals, setGoals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadWellnessData();
    }
  }, [user]);

  const loadWellnessData = async () => {
    try {
      setLoading(true);
      const [scoreData, trendsData, insightsData, goalsData] = await Promise.all([
        healthService.getWellnessScore(user!.id),
        healthService.getWellnessTrends(user!.id),
        healthService.getWellnessInsights(user!.id),
        healthService.getWellnessGoals(user!.id)
      ]);

      setWellnessScore(scoreData);
      setTrends(trendsData);
      setInsights(insightsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading wellness data:', error);
      toast({
        title: t('error.loadingWellnessData'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Wellness Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Wellness Score</span>
            <span className={getScoreColor(wellnessScore.overall)}>
              {wellnessScore.overall}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  Sleep
                </span>
                <span className={getScoreColor(wellnessScore.sleep)}>
                  {wellnessScore.sleep}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </span>
                <span className={getScoreColor(wellnessScore.activity)}>
                  {wellnessScore.activity}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Smile className="h-4 w-4 mr-2" />
                  Mood
                </span>
                <span className={getScoreColor(wellnessScore.mood)}>
                  {wellnessScore.mood}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Pill className="h-4 w-4 mr-2" />
                  Medication
                </span>
                <span className={getScoreColor(wellnessScore.medication)}>
                  {wellnessScore.medication}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Vitals
                </span>
                <span className={getScoreColor(wellnessScore.vitals)}>
                  {wellnessScore.vitals}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Wellness Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-muted rounded-lg"
                >
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Wellness Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Wellness Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    goal.completed ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {goal.icon}
                  </div>
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={goal.completed ? "ghost" : "default"}
                  size="sm"
                  disabled={goal.completed}
                >
                  {goal.completed ? 'Completed' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 gap-4">
          <TabsTrigger value="overview" className="flex flex-col items-center p-3">
            <BarChart4 className="h-5 w-5" />
            <span className="mt-1">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex flex-col items-center p-3">
            <Moon className="h-5 w-5" />
            <span className="mt-1">Sleep</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex flex-col items-center p-3">
            <Activity className="h-5 w-5" />
            <span className="mt-1">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex flex-col items-center p-3">
            <Smile className="h-5 w-5" />
            <span className="mt-1">Mood</span>
          </TabsTrigger>
          <TabsTrigger value="medication" className="flex flex-col items-center p-3">
            <Pill className="h-5 w-5" />
            <span className="mt-1">Meds</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex flex-col items-center p-3">
            <Heart className="h-5 w-5" />
            <span className="mt-1">Vitals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="sleep" className="mt-4">
          <SleepTracker />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityTracker />
        </TabsContent>

        <TabsContent value="mood" className="mt-4">
          <MoodSupport />
        </TabsContent>

        <TabsContent value="medication" className="mt-4">
          <MedicationManager />
        </TabsContent>

        <TabsContent value="vitals" className="mt-4">
          <VitalSignsMonitor groupId={user?.id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
