import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Scale,
  Moon,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VitalSign {
  id: string;
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'bloodSugar' | 'weight' | 'sleep';
  value: number | string;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
}

interface VitalHistory {
  date: string;
  value: number;
}

export const HealthDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [vitalSigns, setVitalSigns] = React.useState<VitalSign[]>([]);
  const [vitalHistory, setVitalHistory] = React.useState<VitalHistory[]>([]);

  // Mock data for demonstration
  React.useEffect(() => {
    const mockVitals: VitalSign[] = [
      {
        id: '1',
        type: 'heartRate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date(),
        status: 'normal',
      },
      {
        id: '2',
        type: 'bloodPressure',
        value: '120/80',
        unit: 'mmHg',
        timestamp: new Date(),
        status: 'normal',
      },
      {
        id: '3',
        type: 'temperature',
        value: 98.6,
        unit: '°F',
        timestamp: new Date(),
        status: 'normal',
      },
      {
        id: '4',
        type: 'bloodSugar',
        value: 95,
        unit: 'mg/dL',
        timestamp: new Date(),
        status: 'normal',
      },
      {
        id: '5',
        type: 'weight',
        value: 150,
        unit: 'lbs',
        timestamp: new Date(),
        status: 'normal',
      },
      {
        id: '6',
        type: 'sleep',
        value: 7.5,
        unit: 'hours',
        timestamp: new Date(),
        status: 'normal',
      },
    ];

    const mockHistory = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: Math.floor(Math.random() * 20) + 70, // Random heart rate between 70-90
    })).reverse();

    setVitalSigns(mockVitals);
    setVitalHistory(mockHistory);
  }, []);

  const getVitalIcon = (type: VitalSign['type']) => {
    switch (type) {
      case 'heartRate':
        return <Heart className="h-5 w-5" />;
      case 'bloodPressure':
        return <Activity className="h-5 w-5" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'bloodSugar':
        return <Droplet className="h-5 w-5" />;
      case 'weight':
        return <Scale className="h-5 w-5" />;
      case 'sleep':
        return <Moon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: VitalSign['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('healthDashboard.title')}</CardTitle>
            <CardDescription>{t('healthDashboard.description')}</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('healthDashboard.addReading')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">{t('healthDashboard.overview')}</TabsTrigger>
            <TabsTrigger value="trends">{t('healthDashboard.trends')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vitalSigns.map((vital) => (
                <Card key={vital.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={getStatusColor(vital.status)}>
                          {getVitalIcon(vital.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {t(`healthDashboard.vitals.${vital.type}`)}
                          </h4>
                          <p className="text-2xl font-bold">
                            {vital.value} {vital.unit}
                          </p>
                        </div>
                      </div>
                      {vital.status !== 'normal' && (
                        <AlertCircle className={`h-5 w-5 ${getStatusColor(vital.status)}`} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="trends">
            <Card>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <h3 className="font-semibold mb-4">{t('healthDashboard.recentAlerts')}</h3>
          <div className="space-y-4">
            {vitalSigns
              .filter((vital) => vital.status !== 'normal')
              .map((vital) => (
                <div
                  key={vital.id}
                  className={`p-4 rounded-lg border ${
                    vital.status === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle
                      className={`h-5 w-5 ${
                        vital.status === 'warning'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    />
                    <div>
                      <h4 className="font-medium">
                        {t(`healthDashboard.alerts.${vital.status}`)}
                      </h4>
                      <p className="text-sm">
                        {t('healthDashboard.alertMessage', {
                          type: t(`healthDashboard.vitals.${vital.type}`),
                          value: vital.value,
                          unit: vital.unit,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
