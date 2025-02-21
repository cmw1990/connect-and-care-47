import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SwipeableContainer, DoubleTapContainer, PullToRefresh } from '@/components/mobile/MobileGestures';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Timer,
  Activity,
  Heart,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';

interface ActivityData {
  timestamp: string;
  steps: number;
  heartRate: number;
  calories: number;
  distance: number;
}

export function ActivityTracker() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isTracking, setIsTracking] = React.useState(false);
  const [activityData, setActivityData] = React.useState<ActivityData[]>([]);
  const [currentActivity, setCurrentActivity] = React.useState({
    steps: 0,
    heartRate: 0,
    calories: 0,
    distance: 0,
  });

  // Simulated data loading
  const loadActivityData = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Add your actual data loading logic here
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  const handleStartStop = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      setIsTracking(!isTracking);
    } catch (error) {
      console.error('Error with haptic feedback:', error);
      setIsTracking(!isTracking);
    }
  };

  const handleTabChange = async (value: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      setActiveTab(value);
    } catch (error) {
      console.error('Error with haptic feedback:', error);
      setActiveTab(value);
    }
  };

  return (
    <PullToRefresh onRefresh={loadActivityData} className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Tracker</CardTitle>
            <Button
              variant={isTracking ? "destructive" : "default"}
              size="sm"
              onClick={handleStartStop}
              className="w-24"
            >
              {isTracking ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SwipeableContainer
            onSwipeLeft={() => handleTabChange('details')}
            onSwipeRight={() => handleTabChange('overview')}
            className="w-full"
          >
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="overview">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <DoubleTapContainer
                      onDoubleTap={() => handleTabChange('details')}
                      className="space-y-4"
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Steps</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">{currentActivity.steps}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Heart Rate</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">{currentActivity.heartRate} bpm</p>
                        </CardContent>
                      </Card>
                    </DoubleTapContainer>

                    <DoubleTapContainer
                      onDoubleTap={() => handleTabChange('details')}
                      className="space-y-4"
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Calories</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">{currentActivity.calories} kcal</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Distance</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">{currentActivity.distance} km</p>
                        </CardContent>
                      </Card>
                    </DoubleTapContainer>
                  </motion.div>
                </TabsContent>

                <TabsContent value="details">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Card>
                      <CardContent className="p-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={activityData}>
                            <XAxis
                              dataKey="timestamp"
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="steps"
                              stroke="#8884d8"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {activityData.map((data, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{data.timestamp}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {data.steps} steps • {data.heartRate} bpm
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </SwipeableContainer>
        </CardContent>
      </Card>
    </PullToRefresh>
  );
}
