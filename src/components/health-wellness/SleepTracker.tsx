
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Moon, Plus, Zap, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { HealthPredictionService } from '@/services/mockServices';
import { useUser } from '@/lib/hooks/use-user';
import { toast } from '@/hooks/use-toast';

interface SleepData {
  date: string;
  hoursSlept: number;
  quality: number;
  notes?: string;
}

export const SleepTracker = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<SleepData>>({
    date: new Date().toISOString().split('T')[0],
    hoursSlept: 7,
    quality: 3,
  });
  
  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        if (!user) return;
        
        // In a real app, this would fetch from the database
        // For now, generate mock data
        const mockData: SleepData[] = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            date: format(date, 'yyyy-MM-dd'),
            hoursSlept: 5 + Math.random() * 4,
            quality: Math.floor(1 + Math.random() * 5),
            notes: i % 3 === 0 ? 'Woke up during the night' : undefined,
          };
        });
        
        setSleepData(mockData);
      } catch (error) {
        console.error('Error fetching sleep data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSleepData();
  }, [user]);

  const handleAddEntry = async () => {
    if (!newEntry.date || !newEntry.hoursSlept || !newEntry.quality) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, this would save to the database
      const newData: SleepData = {
        date: newEntry.date,
        hoursSlept: newEntry.hoursSlept,
        quality: newEntry.quality,
        notes: newEntry.notes,
      };
      
      setSleepData([...sleepData, newData]);
      setIsAddingEntry(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        hoursSlept: 7,
        quality: 3,
      });
      
      toast({
        title: "Sleep entry added",
        description: "Your sleep data has been recorded",
      });
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      toast({
        title: "Failed to add entry",
        description: "There was an error saving your sleep data",
        variant: "destructive",
      });
    }
  };

  // Calculate average sleep metrics
  const averageHours = sleepData.length 
    ? sleepData.reduce((sum, entry) => sum + entry.hoursSlept, 0) / sleepData.length 
    : 0;
  
  const averageQuality = sleepData.length 
    ? sleepData.reduce((sum, entry) => sum + entry.quality, 0) / sleepData.length 
    : 0;

  // Get quality description based on average
  const getQualityDescription = (quality: number) => {
    if (quality >= 4.5) return 'Excellent';
    if (quality >= 3.5) return 'Good';
    if (quality >= 2.5) return 'Fair';
    if (quality >= 1.5) return 'Poor';
    return 'Very poor';
  };

  const chartData = sleepData.map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    Hours: parseFloat(entry.hoursSlept.toFixed(1)),
    Quality: entry.quality,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Loading sleep data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Sleep Tracker
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1"
          onClick={() => setIsAddingEntry(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Entry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Sleep Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Quality"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Sleep Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Average Sleep</h3>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {averageHours.toFixed(1)} hours
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                {averageHours >= 7
                  ? "You're getting good sleep duration"
                  : "Try to get 7-9 hours of sleep"}
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Sleep Quality</h3>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {getQualityDescription(averageQuality)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-purple-600 dark:text-purple-400">
                {averageQuality >= 3.5
                  ? "Your sleep quality is good"
                  : "Try improving your sleep environment"}
              </div>
            </div>
          </div>
          
          {/* Recent Entries */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Sleep Records</h3>
            <div className="space-y-2">
              {sleepData.slice(-3).reverse().map((entry, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{format(new Date(entry.date), 'EEEE, MMM d')}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.hoursSlept.toFixed(1)} hours • Quality: {entry.quality}/5
                    </div>
                    {entry.notes && (
                      <div className="text-xs text-muted-foreground mt-1">{entry.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sleep Entry</DialogTitle>
            <DialogDescription>
              Record your sleep duration and quality
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep-date" className="text-right">
                Date
              </Label>
              <Input
                id="sleep-date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep-hours" className="text-right">
                Hours Slept
              </Label>
              <Input
                id="sleep-hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={newEntry.hoursSlept}
                onChange={(e) => setNewEntry({ ...newEntry, hoursSlept: parseFloat(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep-quality" className="text-right">
                Quality (1-5)
              </Label>
              <Slider
                id="sleep-quality"
                min={1}
                max={5}
                step={1}
                value={[newEntry.quality || 3]}
                onValueChange={(value) => setNewEntry({ ...newEntry, quality: value[0] })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="sleep-notes"
                placeholder="Any additional notes about your sleep..."
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep-factors" className="text-right">
                Sleep Factors
              </Label>
              <Input
                id="sleep-factors"
                placeholder="e.g., caffeine, stress, exercise..."
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
            <Button onClick={handleAddEntry}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
