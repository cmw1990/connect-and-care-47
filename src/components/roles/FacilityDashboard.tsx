import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Activity, Calendar, ClipboardList } from "lucide-react";
import { CareMetrics } from '@/types/roles';

export const FacilityDashboard = ({ groupId }: { groupId: string }) => {
  const [patientMetrics, setPatientMetrics] = useState<CareMetrics>({});
  const [staffSchedule, setStaffSchedule] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatientMetrics();
    fetchStaffSchedule();
  }, [groupId]);

  const fetchPatientMetrics = async () => {
    try {
      const { data: analytics, error } = await supabase
        .from('care_analytics')
        .select('*')
        .eq('group_id', groupId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (analytics) {
        setPatientMetrics(analytics.metric_value as CareMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchStaffSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('care_schedule')
        .select(`
          *,
          profiles:created_by (
            first_name,
            last_name,
            user_type
          )
        `)
        .eq('group_id', groupId)
        .gte('start_time', new Date().toISOString());

      if (error) throw error;
      setStaffSchedule(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const updatePatientMetrics = async (metrics: Partial<CareMetrics>) => {
    try {
      const { error } = await supabase
        .from('care_analytics')
        .insert({
          group_id: groupId,
          metric_type: 'daily_metrics',
          metric_value: metrics
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient metrics updated successfully",
      });

      await fetchPatientMetrics();
    } catch (error) {
      console.error('Error updating metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update metrics",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label>Blood Pressure</Label>
                <Input 
                  value={patientMetrics.vital_signs?.blood_pressure || ''}
                  onChange={(e) => updatePatientMetrics({
                    vital_signs: {
                      ...patientMetrics.vital_signs,
                      blood_pressure: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label>Heart Rate</Label>
                <Input 
                  type="number"
                  value={patientMetrics.vital_signs?.heart_rate || ''}
                  onChange={(e) => updatePatientMetrics({
                    vital_signs: {
                      ...patientMetrics.vital_signs,
                      heart_rate: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Adherence Score</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={patientMetrics.medication_adherence || ''}
                onChange={(e) => updatePatientMetrics({
                  medication_adherence: parseInt(e.target.value)
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Daily Activity Score</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={patientMetrics.activity_level || ''}
                onChange={(e) => updatePatientMetrics({
                  activity_level: parseInt(e.target.value)
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Sleep Score</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={patientMetrics.sleep_quality || ''}
                onChange={(e) => updatePatientMetrics({
                  sleep_quality: parseInt(e.target.value)
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffSchedule.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">
                    {schedule.profiles?.first_name} {schedule.profiles?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(schedule.start_time).toLocaleString()} - 
                    {new Date(schedule.end_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};