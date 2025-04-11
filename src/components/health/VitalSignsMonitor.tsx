
import { useState, useEffect } from "react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityIcon, Heart, Thermometer, TrendingUp } from "lucide-react";

interface VitalData {
  id: string;
  device_type: string;
  readings: Record<string, any>;
  recorded_at: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface VitalReadingsProps {
  userId: string;
}

export const VitalSignsMonitor = ({ userId }: VitalReadingsProps) => {
  const [vitalData, setVitalData] = useState<VitalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const fetchVitalData = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('medical_device_data')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching vital data:', error);
        return;
      }

      // Create mock data if none found for demo purposes
      if (!data || data.length === 0) {
        setVitalData(generateMockVitalData());
      } else {
        setVitalData(data as VitalData[]);
      }
    } catch (error) {
      console.error('Error in fetchVitalData:', error);
      setVitalData(generateMockVitalData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVitalData();
  }, [userId]);

  // Generate some mock vital sign data
  const generateMockVitalData = (): VitalData[] => {
    const now = new Date();
    const mockData: VitalData[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        id: `mock-${i}`,
        device_type: 'health_monitor',
        readings: {
          heart_rate: Math.floor(Math.random() * 20) + 65, // 65-85
          blood_pressure: {
            systolic: Math.floor(Math.random() * 30) + 110, // 110-140
            diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
          },
          blood_oxygen: Math.floor(Math.random() * 5) + 95, // 95-100
          temperature: (Math.random() * 1 + 36.1).toFixed(1), // 36.1-37.1
          respiratory_rate: Math.floor(Math.random() * 6) + 12, // 12-18
        },
        recorded_at: date.toISOString(),
        user_id: userId,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
    
    return mockData;
  };

  // Prepare data for charts
  const prepareChartData = (dataKey: string) => {
    const filteredData = filterDataByTimeframe(vitalData, selectedTimeframe);
    
    if (dataKey === 'blood_pressure') {
      return filteredData.map((item) => ({
        date: new Date(item.recorded_at).toLocaleDateString(),
        systolic: item.readings?.blood_pressure?.systolic || 0,
        diastolic: item.readings?.blood_pressure?.diastolic || 0,
      }));
    }
    
    return filteredData.map((item) => ({
      date: new Date(item.recorded_at).toLocaleDateString(),
      value: item.readings?.[dataKey] || 0,
    }));
  };

  const filterDataByTimeframe = (data: VitalData[], timeframe: string): VitalData[] => {
    const now = new Date();
    const filtered = [...data]; // Clone to avoid mutating state
    
    switch(timeframe) {
      case 'day':
        return filtered.filter(item => {
          const date = new Date(item.recorded_at);
          return date.toDateString() === now.toDateString();
        });
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return filtered.filter(item => new Date(item.recorded_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return filtered.filter(item => new Date(item.recorded_at) >= monthAgo);
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return filtered.filter(item => new Date(item.recorded_at) >= yearAgo);
      default:
        return filtered;
    }
  };

  // Get the most recent reading
  const getLatestReading = (dataKey: string) => {
    if (vitalData.length === 0) return 'N/A';
    
    const latestData = vitalData[0];
    
    if (dataKey === 'blood_pressure') {
      const systolic = latestData.readings?.blood_pressure?.systolic || 'N/A';
      const diastolic = latestData.readings?.blood_pressure?.diastolic || 'N/A';
      return `${systolic}/${diastolic}`;
    }
    
    return latestData.readings?.[dataKey] || 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vital Signs</h2>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchVitalData}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLatestReading('heart_rate')} BPM</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLatestReading('blood_pressure')} mmHg</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLatestReading('temperature')} °C</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Oxygen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLatestReading('blood_oxygen')}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heart_rate">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="heart_rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="blood_pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="blood_oxygen">Blood Oxygen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heart_rate">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData('heart_rate')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="BPM" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blood_pressure">
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData('blood_pressure')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="temperature">
          <Card>
            <CardHeader>
              <CardTitle>Temperature History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData('temperature')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#ff7300" name="°C" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blood_oxygen">
          <Card>
            <CardHeader>
              <CardTitle>Blood Oxygen History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData('blood_oxygen')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" name="%" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
