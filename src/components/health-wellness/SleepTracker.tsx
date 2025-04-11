
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Plus, RefreshCw, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { castQueryResult } from '@/utils/supabaseHelpers';

interface SleepData {
  id: string;
  date: string;
  hours: number;
  quality: number;
  interruptions: number;
  notes?: string;
  user_id: string;
}

interface SleepMetrics {
  average_hours: number;
  average_quality: number;
  streak: number;
  best_streak: number;
  total_records: number;
}

// Mock data for development
const mockSleepData: SleepData[] = [
  { id: '1', date: '2023-05-01', hours: 7.5, quality: 8, interruptions: 1, user_id: 'user-1' },
  { id: '2', date: '2023-05-02', hours: 6.2, quality: 6, interruptions: 3, user_id: 'user-1' },
  { id: '3', date: '2023-05-03', hours: 8.0, quality: 9, interruptions: 0, user_id: 'user-1' },
  { id: '4', date: '2023-05-04', hours: 7.0, quality: 7, interruptions: 2, user_id: 'user-1' },
  { id: '5', date: '2023-05-05', hours: 7.8, quality: 8, interruptions: 1, user_id: 'user-1' },
  { id: '6', date: '2023-05-06', hours: 6.5, quality: 7, interruptions: 2, user_id: 'user-1' },
  { id: '7', date: '2023-05-07', hours: 7.2, quality: 8, interruptions: 1, user_id: 'user-1' },
];

export function SleepTracker() {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [metrics, setMetrics] = useState<SleepMetrics>({
    average_hours: 0,
    average_quality: 0,
    streak: 0,
    best_streak: 0,
    total_records: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newEntry, setNewEntry] = useState<Partial<SleepData>>({
    date: new Date().toISOString().split('T')[0],
    hours: 7,
    quality: 7,
    interruptions: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSleepData();
  }, []);

  const fetchSleepData = async () => {
    try {
      // In a real application, this would fetch from the database
      setSleepData(mockSleepData);
      
      // Calculate metrics
      calculateMetrics(mockSleepData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      toast({
        title: "Error",
        description: "Failed to load sleep data",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: SleepData[]) => {
    if (!data || data.length === 0) {
      setMetrics({
        average_hours: 0,
        average_quality: 0,
        streak: 0,
        best_streak: 0,
        total_records: 0,
      });
      return;
    }

    const totalHours = data.reduce((sum, entry) => sum + entry.hours, 0);
    const totalQuality = data.reduce((sum, entry) => sum + entry.quality, 0);
    
    // Sort by date for streak calculation
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate streak (consecutive days with sleep records)
    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = new Date(sortedData[i-1].date);
      const currDate = new Date(sortedData[i].date);
      
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    setMetrics({
      average_hours: parseFloat((totalHours / data.length).toFixed(1)),
      average_quality: parseFloat((totalQuality / data.length).toFixed(1)),
      streak: currentStreak,
      best_streak: maxStreak,
      total_records: data.length,
    });
  };

  const handleSubmit = async () => {
    try {
      const newSleepEntry: SleepData = {
        id: `sleep-${Date.now()}`,
        date: newEntry.date || new Date().toISOString().split('T')[0],
        hours: newEntry.hours || 0,
        quality: newEntry.quality || 0,
        interruptions: newEntry.interruptions || 0,
        user_id: 'user-1', // In a real app, this would be the current user ID
        notes: newEntry.notes,
      };
      
      // In a real application, this would save to the database
      const updatedData = [...sleepData, newSleepEntry];
      setSleepData(updatedData);
      calculateMetrics(updatedData);
      
      toast({
        title: "Success",
        description: "Sleep entry added successfully",
      });
      
      // Reset the form
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        hours: 7,
        quality: 7,
        interruptions: 0,
      });
      
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      toast({
        title: "Error",
        description: "Failed to add sleep entry",
        variant: "destructive",
      });
    }
  };

  // Format data for the chart
  const chartData = sleepData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    hours: entry.hours,
    quality: entry.quality / 10, // Scale quality to match hours
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Moon className="mr-2 h-5 w-5" />
            Sleep Tracker
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={fetchSleepData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Sleep Record</DialogTitle>
                  <DialogDescription>
                    Track your sleep details to monitor patterns and improve rest quality.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sleep-date">
                      Date
                    </Label>
                    <Input
                      id="sleep-date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sleep-duration">
                      Hours Slept: {newEntry.hours}
                    </Label>
                    <Input
                      id="sleep-duration"
                      type="number"
                      min="0"
                      max="24"
                      step="0.1"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) })}
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sleep-quality">
                      Sleep Quality: {newEntry.quality}/10
                    </Label>
                    <Slider
                      id="sleep-quality"
                      min={1}
                      max={10}
                      step={1}
                      value={newEntry.quality ? [newEntry.quality] : [7]}
                      onValueChange={(value) => setNewEntry({ ...newEntry, quality: value[0] })}
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sleep-interruptions">
                      Interruptions
                    </Label>
                    <Input
                      id="sleep-interruptions"
                      type="number"
                      min="0"
                      value={newEntry.interruptions}
                      onChange={(e) => setNewEntry({ ...newEntry, interruptions: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="sleep-notes">
                      Notes (optional)
                    </Label>
                    <Input
                      id="sleep-notes"
                      placeholder="Any notes about your sleep..."
                      value={newEntry.notes || ''}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    />
                  </div>
                  
                  <Button className="w-full" onClick={handleSubmit}>
                    Save Sleep Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground">Avg. Hours</div>
                <div className="text-2xl font-bold">{metrics.average_hours} hrs</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground">Quality</div>
                <div className="text-2xl font-bold">{metrics.average_quality}/10</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground">Current Streak</div>
                <div className="text-2xl font-bold">{metrics.streak} days</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium text-muted-foreground">Best Streak</div>
                <div className="text-2xl font-bold">{metrics.best_streak} days</div>
              </div>
            </div>

            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 12]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" name="Hours Slept" />
                  <Area type="monotone" dataKey="quality" stroke="#82ca9d" fill="#82ca9d" name="Quality (scaled)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="text-lg font-medium">Recent Sleep Records</h3>
              <div className="space-y-2">
                {sleepData.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {new Date(entry.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.hours} hours • Quality: {entry.quality}/10
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.interruptions} interruptions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
