
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BedDouble, Moon, Plus, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

// Sleep data interface
interface SleepData {
  id: string;
  date: string;
  hoursSlept: number;
  quality: number;
  bedTime: string;
  wakeTime: string;
  notes?: string;
}

export const SleepTracker: React.FC = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<SleepData>>({
    hoursSlept: 7,
    quality: 3,
    bedTime: '22:00',
    wakeTime: '07:00',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      const mockData: SleepData[] = [
        {
          id: '1',
          date: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 7.5,
          quality: 4,
          bedTime: '22:30',
          wakeTime: '06:00'
        },
        {
          id: '2',
          date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 6.2,
          quality: 2,
          bedTime: '23:45',
          wakeTime: '06:00'
        },
        {
          id: '3',
          date: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 8.0,
          quality: 5,
          bedTime: '22:00',
          wakeTime: '06:00'
        },
        {
          id: '4',
          date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 7.8,
          quality: 4,
          bedTime: '22:15',
          wakeTime: '06:00'
        },
        {
          id: '5',
          date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 5.5,
          quality: 2,
          bedTime: '00:30',
          wakeTime: '06:00'
        },
        {
          id: '6',
          date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          hoursSlept: 6.7,
          quality: 3,
          bedTime: '23:00',
          wakeTime: '06:00'
        },
      ];
      
      setSleepData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddEntry = () => {
    if (!newEntry.date || !newEntry.hoursSlept || !newEntry.quality) {
      toast.error("Please fill all required fields");
      return;
    }

    const entry: SleepData = {
      id: Date.now().toString(),
      date: newEntry.date,
      hoursSlept: newEntry.hoursSlept,
      quality: newEntry.quality,
      bedTime: newEntry.bedTime || '22:00',
      wakeTime: newEntry.wakeTime || '07:00',
      notes: newEntry.notes
    };

    setSleepData(prev => [...prev, entry]);
    setIsAddingEntry(false);
    toast.success("Sleep entry added successfully");

    // Reset form
    setNewEntry({
      hoursSlept: 7,
      quality: 3,
      bedTime: '22:00',
      wakeTime: '07:00',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCancel = () => {
    setIsAddingEntry(false);
    toast.info("Entry cancelled");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleQualityChange = (value: number[]) => {
    setNewEntry(prev => ({ ...prev, quality: value[0] }));
  };

  // Format data for chart display
  const chartData = sleepData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      hoursSlept: entry.hoursSlept,
      quality: entry.quality
    }));

  // Function to determine sleep quality text
  const getSleepQualityText = (quality: number) => {
    switch(quality) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="h-5 w-5" />
            <span>Sleep Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Moon className="h-5 w-5 text-blue-500" />
          <span>Sleep Tracker</span>
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setIsAddingEntry(true)}
        >
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" domain={[0, 10]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="hoursSlept" name="Hours Slept" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="quality" name="Sleep Quality (1-5)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {sleepData.slice(-3).reverse().map(entry => (
            <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {getSleepQualityText(entry.quality)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{entry.bedTime} - {entry.wakeTime}</span>
                </div>
                <span className="font-bold">{entry.hoursSlept}h</span>
              </div>
              {entry.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>

        <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sleep Entry</DialogTitle>
              <DialogDescription>
                Record your sleep details for better tracking
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={newEntry.date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedTime">Bed Time</Label>
                  <Input
                    id="bedTime"
                    name="bedTime"
                    type="time"
                    value={newEntry.bedTime}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input
                    id="wakeTime"
                    name="wakeTime"
                    type="time"
                    value={newEntry.wakeTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hoursSlept">Hours Slept</Label>
                <Input
                  id="hoursSlept"
                  name="hoursSlept"
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={newEntry.hoursSlept}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Sleep Quality (1-5)</Label>
                <Slider
                  defaultValue={[newEntry.quality || 3]}
                  max={5}
                  min={1}
                  step={1}
                  onValueChange={handleQualityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={newEntry.notes || ''}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about your sleep"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry}>
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
