
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bed, Moon, Clock, Activity, Plus, CalendarIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sleep } from '@/utils/supabaseHelpers';

// Interface for a sleep record
interface SleepRecord {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
  interruptions?: number;
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
}

export const SleepTracker = () => {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState<Omit<SleepRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    sleepTime: '22:00',
    wakeTime: '06:00',
    duration: 8,
    quality: 7,
  });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSleepData();
  }, []);
  
  const fetchSleepData = async () => {
    try {
      // Mock data for development
      const mockData: SleepRecord[] = [
        {
          id: '1',
          date: '2023-07-10',
          sleepTime: '22:30',
          wakeTime: '06:30',
          duration: 8,
          quality: 7,
          interruptions: 2,
          deepSleepMinutes: 120,
          remSleepMinutes: 90
        },
        {
          id: '2',
          date: '2023-07-11',
          sleepTime: '23:00',
          wakeTime: '07:00',
          duration: 8,
          quality: 8,
          interruptions: 1,
          deepSleepMinutes: 150,
          remSleepMinutes: 100
        },
        {
          id: '3',
          date: '2023-07-12',
          sleepTime: '22:00',
          wakeTime: '05:30',
          duration: 7.5,
          quality: 6,
          interruptions: 3,
          deepSleepMinutes: 110,
          remSleepMinutes: 85
        },
        {
          id: '4',
          date: '2023-07-13',
          sleepTime: '23:30',
          wakeTime: '07:30',
          duration: 8,
          quality: 9,
          interruptions: 0,
          deepSleepMinutes: 180,
          remSleepMinutes: 120
        },
        {
          id: '5',
          date: '2023-07-14',
          sleepTime: '22:30',
          wakeTime: '06:00',
          duration: 7.5,
          quality: 7,
          interruptions: 2,
          deepSleepMinutes: 130,
          remSleepMinutes: 95
        }
      ];
      
      // Simulate API delay
      await sleep(500);
      
      setSleepRecords(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      toast({
        title: "Error",
        description: "Failed to load sleep data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const handleAddRecord = async () => {
    try {
      // Calculate duration if not filled
      const startTime = new Date(`2000-01-01T${newRecord.sleepTime}`);
      const endTime = new Date(`2000-01-01T${newRecord.wakeTime}`);
      
      // Adjust for next day if wake time is earlier than sleep time
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      const recordToAdd: SleepRecord = {
        ...newRecord,
        id: `sleep-${Date.now()}`,
        duration: Math.round(durationHours * 10) / 10, // Round to 1 decimal place
      };
      
      // In a real application, you would add to the database
      setSleepRecords([...sleepRecords, recordToAdd]);
      
      toast({
        title: "Success",
        description: "Sleep record added successfully",
      });
      
      // Reset form
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        sleepTime: '22:00',
        wakeTime: '06:00',
        duration: 8,
        quality: 7,
      });
    } catch (error) {
      console.error('Error adding sleep record:', error);
      toast({
        title: "Error",
        description: "Failed to add sleep record",
        variant: "destructive",
      });
    }
  };
  
  // Calculate averages for the dashboard
  const calculateAverages = () => {
    if (sleepRecords.length === 0) return { avgDuration: 0, avgQuality: 0 };
    
    const totalDuration = sleepRecords.reduce((sum, record) => sum + record.duration, 0);
    const totalQuality = sleepRecords.reduce((sum, record) => sum + record.quality, 0);
    
    return {
      avgDuration: Math.round((totalDuration / sleepRecords.length) * 10) / 10,
      avgQuality: Math.round((totalQuality / sleepRecords.length) * 10) / 10,
    };
  };
  
  const { avgDuration, avgQuality } = calculateAverages();
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sleep Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Moon className="mr-2 h-5 w-5" />
          Sleep Tracker
        </CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Sleep Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sleep Record</DialogTitle>
              <DialogDescription>
                Enter details about your sleep session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    type="date"
                    id="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sleepTime">Sleep Time</Label>
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    type="time"
                    id="sleepTime"
                    value={newRecord.sleepTime}
                    onChange={(e) => setNewRecord({ ...newRecord, sleepTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="wakeTime">Wake Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    type="time"
                    id="wakeTime"
                    value={newRecord.wakeTime}
                    onChange={(e) => setNewRecord({ ...newRecord, wakeTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="quality">Sleep Quality (1-10)</Label>
                <Slider
                  id="quality"
                  min={1}
                  max={10}
                  step={1}
                  value={[newRecord.quality]}
                  onValueChange={(values) => setNewRecord({ ...newRecord, quality: values[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>{newRecord.quality}</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any notes about your sleep..."
                  value={newRecord.notes || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="interruptions">Number of Interruptions (Optional)</Label>
                <Input
                  id="interruptions"
                  type="number"
                  min="0"
                  value={newRecord.interruptions || 0}
                  onChange={(e) => setNewRecord({ ...newRecord, interruptions: parseInt(e.target.value) })}
                />
              </div>
              
              <Button onClick={handleAddRecord} className="w-full">
                Save Sleep Record
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Bed className="h-8 w-8 mr-2 text-blue-500" />
                      <div>
                        <div className="text-xl font-bold">{avgDuration}h</div>
                        <div className="text-sm text-muted-foreground">Avg. Sleep Duration</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 mr-2 text-green-500" />
                      <div>
                        <div className="text-xl font-bold">{avgQuality}/10</div>
                        <div className="text-sm text-muted-foreground">Avg. Sleep Quality</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Sleep Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepRecords.slice(-7).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 12]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="duration" fill="#6366f1" name="Sleep Duration (hours)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {sleepRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="inline-flex items-center mr-4">
                            <Clock className="mr-1 h-4 w-4" />
                            {record.sleepTime} - {record.wakeTime}
                          </span>
                          <span className="inline-flex items-center mr-4">
                            <Bed className="mr-1 h-4 w-4" />
                            {record.duration} hours
                          </span>
                          <span className="inline-flex items-center">
                            <Activity className="mr-1 h-4 w-4" />
                            Quality: {record.quality}/10
                          </span>
                        </div>
                        {record.notes && (
                          <div className="mt-2 text-sm">{record.notes}</div>
                        )}
                        {record.interruptions !== undefined && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Interruptions: {record.interruptions}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Quality Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sleepRecords.slice(-7).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="quality" stroke="#8884d8" name="Sleep Quality (1-10)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {sleepRecords.some(r => r.deepSleepMinutes && r.remSleepMinutes) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sleep Stages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sleepRecords.slice(-5).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="deepSleepMinutes" fill="#6366f1" name="Deep Sleep (minutes)" />
                          <Bar dataKey="remSleepMinutes" fill="#ec4899" name="REM Sleep (minutes)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
