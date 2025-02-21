import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Heart,
  Moon,
  Pill,
  TrendingUp,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { wearableService } from '@/lib/device-integration/wearable-service';
import { useUser } from '@/lib/hooks/use-user';

export function MobileHealthDashboard() {
  const { user } = useUser();
  const [healthData, setHealthData] = React.useState<any>({
    vitals: [],
    activities: [],
    medications: [],
    sleep: [],
  });
  const [devices, setDevices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load connected devices
        const devices = await wearableService.getDevices(user.id);
        setDevices(devices);

        // Load health data
        // This would be replaced with actual API calls to your backend
        setHealthData({
          vitals: [
            { time: '09:00', heartRate: 72 },
            { time: '10:00', heartRate: 75 },
            { time: '11:00', heartRate: 73 },
            { time: '12:00', heartRate: 78 },
          ],
          activities: [
            { type: 'Walking', duration: 30, calories: 150 },
            { type: 'Exercise', duration: 45, calories: 300 },
          ],
          medications: [
            { name: 'Medicine A', time: '09:00', taken: true },
            { name: 'Medicine B', time: '13:00', taken: false },
          ],
          sleep: [
            { date: '2025-02-19', hours: 7.5, quality: 'Good' },
            { date: '2025-02-18', hours: 6.8, quality: 'Fair' },
          ],
        });
      } catch (error) {
        console.error('Error loading health data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please sign in to view your health dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Progress value={33} className="w-full" />
          <p className="text-center mt-2">Loading your health data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connected Devices */}
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex gap-2 p-1 min-w-full">
          {devices.map((device) => (
            <Card key={device.id} className="min-w-[200px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{device.model}</p>
                    <p className="text-sm text-muted-foreground">
                      Battery: {device.batteryLevel}%
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'connected' ? 'bg-green-500' :
                    device.status === 'syncing' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="min-w-[200px] h-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </ScrollArea>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Heart Rate</p>
                <p className="text-2xl font-bold">72 BPM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Steps</p>
                <p className="text-2xl font-bold">8,432</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Data */}
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="medications">Meds</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData.vitals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData.activities.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.duration} minutes
                      </p>
                    </div>
                    <p className="font-medium">{activity.calories} cal</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData.medications.map((med: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.time}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        med.taken ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sleep Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthData.sleep.map((sleep: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{sleep.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {sleep.quality}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{sleep.hours} hrs</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Health Alerts */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1" />
            <div>
              <p className="font-medium text-yellow-900">Health Alert</p>
              <p className="text-sm text-yellow-800">
                Your heart rate was above normal at 2:30 PM. Consider taking a rest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
