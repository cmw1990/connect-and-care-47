
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Thermometer, Activity, BarChart } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { VitalData } from "@/types/database.types";

interface VitalSignsMonitorProps {
  userId: string;
}

export const VitalSignsMonitor = ({ userId }: VitalSignsMonitorProps) => {
  const [vitalSigns, setVitalSigns] = useState<VitalData[]>([]);
  const [displayPeriod, setDisplayPeriod] = useState("day");
  const { toast } = useToast();

  useEffect(() => {
    fetchVitalSigns();
  }, [userId, displayPeriod]);

  const fetchVitalSigns = async () => {
    try {
      // Get time period based on selection
      const now = new Date();
      let startDate = new Date();
      
      if (displayPeriod === "day") {
        startDate.setDate(now.getDate() - 1);
      } else if (displayPeriod === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (displayPeriod === "month") {
        startDate.setMonth(now.getMonth() - 1);
      }

      const { data, error } = await supabaseClient
        .from('medical_device_data')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error("Error fetching vital signs:", error);
        return;
      }

      // Create a new array of properly shaped VitalData objects 
      const transformedData: VitalData[] = data ? data.map(item => ({
        id: item.id,
        device_type: item.device_type || 'unknown',
        readings: item.readings || {},
        recorded_at: item.recorded_at || new Date().toISOString(),
        user_id: item.user_id,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      })) : [];

      setVitalSigns(transformedData);
    } catch (error) {
      console.error("Error fetching vital signs data:", error);
    }
  };

  const getHeartRateStatus = (heartRate: number) => {
    if (heartRate < 60) return "low";
    if (heartRate > 100) return "high";
    return "normal";
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic > 140 || diastolic > 90) return "high";
    if (systolic < 90 || diastolic < 60) return "low";
    return "normal";
  };

  const getTemperatureStatus = (temperature: number) => {
    if (temperature > 38) return "high";
    if (temperature < 36) return "low";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high": return "text-red-500";
      case "low": return "text-blue-500";
      case "normal": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getLatestVitals = () => {
    if (vitalSigns.length === 0) return null;
    
    // Get the most recent readings for each vital sign type
    const bloodPressureReading = vitalSigns.find(v => 
      v.readings && v.readings.blood_pressure
    );
    
    const heartRateReading = vitalSigns.find(v => 
      v.readings && v.readings.heart_rate !== undefined
    );
    
    const temperatureReading = vitalSigns.find(v => 
      v.readings && v.readings.temperature !== undefined
    );
    
    return {
      bloodPressure: bloodPressureReading?.readings?.blood_pressure,
      heartRate: heartRateReading?.readings?.heart_rate,
      temperature: temperatureReading?.readings?.temperature,
      lastUpdated: vitalSigns[0]?.recorded_at
    };
  };

  const latestVitals = getLatestVitals();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Vital Signs</h2>
        <div className="flex items-center gap-2">
          <Select value={displayPeriod} onValueChange={setDisplayPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchVitalSigns}>
            Refresh
          </Button>
        </div>
      </div>

      {!latestVitals && (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No vital sign data available</p>
        </div>
      )}

      {latestVitals && (
        <div className="grid gap-4 md:grid-cols-3">
          {latestVitals.heartRate !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-baseline">
                  {latestVitals.heartRate}
                  <span className="ml-1 text-sm text-muted-foreground">bpm</span>
                  <span className={`ml-2 text-sm ${getStatusColor(getHeartRateStatus(latestVitals.heartRate))}`}>
                    {getHeartRateStatus(latestVitals.heartRate)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(latestVitals.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {latestVitals.bloodPressure && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  Blood Pressure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-baseline">
                  {latestVitals.bloodPressure.systolic}/{latestVitals.bloodPressure.diastolic}
                  <span className="ml-1 text-sm text-muted-foreground">mmHg</span>
                  <span className={`ml-2 text-sm ${getStatusColor(getBloodPressureStatus(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic))}`}>
                    {getBloodPressureStatus(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(latestVitals.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {latestVitals.temperature !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-baseline">
                  {latestVitals.temperature}
                  <span className="ml-1 text-sm text-muted-foreground">°C</span>
                  <span className={`ml-2 text-sm ${getStatusColor(getTemperatureStatus(latestVitals.temperature))}`}>
                    {getTemperatureStatus(latestVitals.temperature)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(latestVitals.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2 flex items-center">
          <BarChart className="h-4 w-4 mr-2 text-gray-500" />
          Vital Signs History
        </h3>
        <div className="space-y-4">
          {vitalSigns.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No history available</p>
          ) : (
            vitalSigns.slice(0, 5).map((vital) => (
              <div key={vital.id} className="border-b pb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{vital.device_type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(vital.recorded_at).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {vital.readings.heart_rate !== undefined && (
                    <div>HR: {vital.readings.heart_rate} bpm</div>
                  )}
                  {vital.readings.blood_pressure && (
                    <div>BP: {vital.readings.blood_pressure.systolic}/{vital.readings.blood_pressure.diastolic}</div>
                  )}
                  {vital.readings.temperature !== undefined && (
                    <div>Temp: {vital.readings.temperature}°C</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
