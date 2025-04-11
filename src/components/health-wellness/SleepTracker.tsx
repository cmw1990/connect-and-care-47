
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { sleep } from '@/utils/supabaseHelpers';

interface SleepData {
  date: string;
  hours: number;
  quality: string;
}

export const SleepTracker = () => {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSleepHours, setNewSleepHours] = useState(7);

  useEffect(() => {
    // Fetch sleep data
    fetchSleepData();
  }, []);

  const fetchSleepData = () => {
    // Use mock data from the utility - correctly calling the function
    const data = sleep.getSleepData();
    setSleepData(data);
  };

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent':
        return '#22c55e';
      case 'good':
        return '#3b82f6';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getAverageSleepHours = () => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, data) => sum + data.hours, 0);
    return (total / sleepData.length).toFixed(1);
  };

  const getSleepQualityPercentage = (quality: string) => {
    if (sleepData.length === 0) return 0;
    const count = sleepData.filter(data => data.quality.toLowerCase() === quality.toLowerCase()).length;
    return Math.round((count / sleepData.length) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Sleep Tracker</CardTitle>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Sleep
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-4">Sleep Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <span className="text-sm text-gray-500">Average Sleep</span>
                <p className="text-xl font-bold">{getAverageSleepHours()} hrs</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <span className="text-sm text-gray-500">Good Sleep</span>
                <p className="text-xl font-bold">{getSleepQualityPercentage('good')}%</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Calendar</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            {showAddForm && (
              <div className="mt-4 p-4 border rounded-md">
                <h4 className="font-medium mb-2">Log Sleep for {selectedDate?.toDateString()}</h4>
                {/* Add form fields here */}
                <Button className="mt-4 w-full">Save</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
