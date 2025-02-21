import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwipeableContainer, DoubleTapContainer, PullToRefresh } from '@/components/mobile/MobileGestures';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Clock,
  Battery,
  BarChart,
  BedDouble,
  MoreVertical,
  Plus,
  Star,
  AlertCircle,
  Zap,
  CalendarDays,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { healthService } from '@/lib/supabase/health-service';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SleepData {
  date: string;
  duration: number;
  quality: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awakeTime: number;
}

export const SleepTracker = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useUser();
  const [sleepLogs, setSleepLogs] = React.useState<any[]>([]);
  const [isAddingSleep, setIsAddingSleep] = React.useState(false);
  const [newSleep, setNewSleep] = React.useState({
    sleepStart: '',
    sleepEnd: '',
    quality: 5,
    interruptions: 0,
    notes: '',
  });
  const [isTracking, setIsTracking] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      loadSleepLogs();
    }
  }, [user]);

  const loadSleepLogs = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      const data = await healthService.getSleepLogs(user!.id);
      setSleepLogs(data);
    } catch (error) {
      console.error('Error loading sleep logs:', error);
      toast({
        title: t('error.loadingSleepLogs'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    }
  };

  const handleAddSleep = async () => {
    if (!newSleep.sleepStart || !newSleep.sleepEnd) {
      toast({
        title: t('error.invalidSleepLog'),
        description: t('error.pleaseCompleteAllFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await healthService.addSleepLog({
        userId: user!.id,
        sleepStart: new Date(newSleep.sleepStart),
        sleepEnd: new Date(newSleep.sleepEnd),
        quality: newSleep.quality,
        interruptions: newSleep.interruptions,
        notes: newSleep.notes,
      });

      setIsAddingSleep(false);
      setNewSleep({
        sleepStart: '',
        sleepEnd: '',
        quality: 5,
        interruptions: 0,
        notes: '',
      });

      loadSleepLogs();

      toast({
        title: t('success.sleepLogAdded'),
        description: t('success.sleepLogAddedDescription'),
      });
    } catch (error) {
      console.error('Error adding sleep log:', error);
      toast({
        title: t('error.addingSleepLog'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
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

  const handleSelectDate = async (date: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      setSelectedDate(date === selectedDate ? null : date);
    } catch (error) {
      console.error('Error with haptic feedback:', error);
      setSelectedDate(date === selectedDate ? null : date);
    }
  };

  const calculateSleepDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return Math.round(duration * 10) / 10;
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 3) return 'text-red-500';
    if (quality <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const chartData = sleepLogs
    .slice(-7)
    .map((log) => ({
      date: new Date(log.sleep_start).toLocaleDateString(),
      hours: calculateSleepDuration(log.sleep_start, log.sleep_end),
      quality: log.quality,
    }))
    .reverse();

  return (
    <PullToRefresh onRefresh={loadSleepLogs} className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('sleepTracker.title')}</CardTitle>
              <CardDescription>{t('sleepTracker.description')}</CardDescription>
            </div>
            <Button
              variant={isTracking ? "destructive" : "default"}
              size="sm"
              onClick={handleStartStop}
              className="w-24"
            >
              {isTracking ? (
                <>
                  <Sun className="mr-2 h-4 w-4" /> Wake
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" /> Sleep
                </>
              )}
            </Button>
            <Dialog open={isAddingSleep} onOpenChange={setIsAddingSleep}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('sleepTracker.addSleep')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('sleepTracker.newSleepLog')}</DialogTitle>
                  <DialogDescription>
                    {t('sleepTracker.newSleepLogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sleepStart">
                      {t('sleepTracker.sleepStart')}
                    </Label>
                    <Input
                      id="sleepStart"
                      type="datetime-local"
                      value={newSleep.sleepStart}
                      onChange={(e) =>
                        setNewSleep({ ...newSleep, sleepStart: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleepEnd">{t('sleepTracker.sleepEnd')}</Label>
                    <Input
                      id="sleepEnd"
                      type="datetime-local"
                      value={newSleep.sleepEnd}
                      onChange={(e) =>
                        setNewSleep({ ...newSleep, sleepEnd: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>{t('sleepTracker.quality')}</Label>
                    <Slider
                      value={[newSleep.quality]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) =>
                        setNewSleep({ ...newSleep, quality: value })
                      }
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{t('sleepTracker.poor')}</span>
                      <span>{t('sleepTracker.excellent')}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interruptions">
                      {t('sleepTracker.interruptions')}
                    </Label>
                    <Input
                      id="interruptions"
                      type="number"
                      min="0"
                      value={newSleep.interruptions}
                      onChange={(e) =>
                        setNewSleep({
                          ...newSleep,
                          interruptions: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">{t('sleepTracker.notes')}</Label>
                    <Input
                      id="notes"
                      value={newSleep.notes}
                      onChange={(e) =>
                        setNewSleep({ ...newSleep, notes: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleAddSleep}>
                    {t('sleepTracker.addSleep')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <SwipeableContainer
            onSwipeLeft={() => {/* Navigate to next day */}}
            onSwipeRight={() => {/* Navigate to previous day */}}
            className="w-full"
          >
            <motion.div
              layout
              className="grid grid-cols-2 gap-4"
            >
              <DoubleTapContainer
                onDoubleTap={() => handleSelectDate(new Date().toISOString())}
                className="space-y-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Duration</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">8h 12m</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Quality</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">85%</p>
                  </CardContent>
                </Card>
              </DoubleTapContainer>

              <DoubleTapContainer
                onDoubleTap={() => handleSelectDate(new Date().toISOString())}
                className="space-y-4"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Deep Sleep</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">2h 45m</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Sleep Score</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">92</p>
                  </CardContent>
                </Card>
              </DoubleTapContainer>
            </motion.div>

            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="mt-4"
                >
                  <Card>
                    <CardContent className="p-4">
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Sleep Stages</p>
                              <div className="grid grid-cols-3 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Deep</p>
                                  <p className="text-lg font-medium">2h 45m</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Light</p>
                                  <p className="text-lg font-medium">4h 30m</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">REM</p>
                                  <p className="text-lg font-medium">1h 15m</p>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <p className="font-medium">Sleep Timeline</p>
                            <div className="h-16 mt-2 rounded-lg bg-muted">
                              {/* Add sleep timeline visualization here */}
                            </div>
                          </div>

                          <div>
                            <p className="font-medium">Environmental Factors</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Room Temp</p>
                                <p className="text-lg font-medium">21°C</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Noise Level</p>
                                <p className="text-lg font-medium">Low</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </SwipeableContainer>

          <Card>
            <CardHeader>
              <CardTitle>{t('sleepTracker.weeklyOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="hours"
                      stroke="#2563eb"
                      name={t('sleepTracker.hours')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quality"
                      stroke="#10b981"
                      name={t('sleepTracker.quality')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {sleepLogs.slice(0, 5).map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">
                          {calculateSleepDuration(
                            log.sleep_start,
                            log.sleep_end
                          )}{' '}
                          {t('sleepTracker.hours')}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(log.sleep_start).toLocaleTimeString()} -{' '}
                            {new Date(log.sleep_end).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(log.sleep_start).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star
                          className={`h-4 w-4 ${getQualityColor(log.quality)}`}
                        />
                        <span className={getQualityColor(log.quality)}>
                          {log.quality}/10
                        </span>
                      </div>
                      {log.interruptions > 0 && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Zap className="h-4 w-4" />
                          <span>{log.interruptions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {log.notes && (
                    <p className="mt-2 text-sm text-gray-600">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </PullToRefresh>
  );
};
