
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Award, TrendingUp, Calendar } from 'lucide-react';

export interface CareGuideProgressProps {
  value: number;
  className?: string;
}

export const CareGuideProgress: React.FC<CareGuideProgressProps> = ({ 
  value,
  className = "" 
}) => {
  return (
    <div className={className}>
      <Progress value={value} className="h-2" />
      <div className="text-xs text-muted-foreground mt-1 text-right">{Math.round(value)}% Complete</div>
    </div>
  );
};

interface DetailedProgressProps {
  completedSteps: number;
  totalSteps: number;
  streakDays: number;
}

export const DetailedCareGuideProgress: React.FC<DetailedProgressProps> = ({
  completedSteps,
  totalSteps,
  streakDays
}) => {
  const percentComplete = Math.round((completedSteps / totalSteps) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Care Guide Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Overall Progress</div>
              <div className="text-sm font-medium">{percentComplete}%</div>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 mb-2 text-primary" />
              <div className="text-lg font-bold">{completedSteps}</div>
              <div className="text-xs text-center text-muted-foreground">Completed Steps</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
              <Award className="h-6 w-6 mb-2 text-primary" />
              <div className="text-lg font-bold">{streakDays}</div>
              <div className="text-xs text-center text-muted-foreground">Day Streak</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 mb-2 text-primary" />
              <div className="text-lg font-bold">{totalSteps}</div>
              <div className="text-xs text-center text-muted-foreground">Total Steps</div>
            </div>
          </div>
          
          <Tabs defaultValue="daily">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Day 1</div>
                  <div className="text-xs text-muted-foreground">2/3 Tasks</div>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Week 1</div>
                  <div className="text-xs text-muted-foreground">12/15 Tasks</div>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </TabsContent>
            <TabsContent value="monthly" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Month 1</div>
                  <div className="text-xs text-muted-foreground">45/60 Tasks</div>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
