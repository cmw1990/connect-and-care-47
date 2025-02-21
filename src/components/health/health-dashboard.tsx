import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Heart, Brain, Thermometer } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthMetric {
  timestamp: string;
  value: number;
  notes?: string;
}

export function HealthDashboard() {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = useState("vitals");

  // Sample data - will be replaced with real data from Supabase
  const sampleData: HealthMetric[] = [
    { timestamp: "2025-02-19", value: 120, notes: "Morning reading" },
    { timestamp: "2025-02-20", value: 118, notes: "After exercise" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('health.monitoring')}
        </h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('health.addReading')}
        </Button>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1">
          <TabsTrigger value="vitals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Heart className="mr-2 h-4 w-4" />
            {t('health.vitals')}
          </TabsTrigger>
          <TabsTrigger value="mood">
            <Brain className="mr-2 h-4 w-4" />
            {t('health.mood')}
          </TabsTrigger>
          <TabsTrigger value="symptoms">
            <Thermometer className="mr-2 h-4 w-4" />
            {t('health.symptoms')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <Card className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('health.latestReading')}
              </div>
              <div className="text-2xl font-bold">120/80</div>
              <div className="text-sm text-muted-foreground">
                {t('health.lastUpdated')}: 2h ago
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('health.average')}
              </div>
              <div className="text-2xl font-bold">118/78</div>
              <div className="text-sm text-muted-foreground">
                {t('health.last7Days')}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t('health.trend')}
              </div>
              <div className="text-2xl font-bold text-green-600">↓ 2%</div>
              <div className="text-sm text-muted-foreground">
                {t('health.improving')}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Similar content for mood and symptoms tabs */}
      </Tabs>
    </div>
  );
}
