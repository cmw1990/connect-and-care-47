import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Heart, Bell } from "lucide-react";
import type { CareMetrics } from '@/types/roles';

export const FamilyCaregiverView = ({ groupId }: { groupId: string }) => {
  const [patientMetrics, setPatientMetrics] = useState<CareMetrics>({});
  const [caregiverReports, setCaregiverReports] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPatientMetrics();
    fetchCaregiverReports();
  }, [groupId]);

  const fetchPatientMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('care_analytics')
        .select('*')
        .eq('group_id', groupId)
        .eq('metric_type', 'daily_metrics')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setPatientMetrics(data.metric_value as CareMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchCaregiverReports = async () => {
    try {
      const { data, error } = await supabase
        .from('care_analytics')
        .select(`
          *,
          profiles:created_by (
            first_name,
            last_name,
            user_type
          )
        `)
        .eq('group_id', groupId)
        .eq('metric_type', 'caregiver_report')
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setCaregiverReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          group_id: groupId,
          content: message.trim(),
          message_type: 'family_message'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patientMetrics.vital_signs && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Blood Pressure</p>
                  <p className="text-lg font-medium">{patientMetrics.vital_signs.blood_pressure}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Heart Rate</p>
                  <p className="text-lg font-medium">{patientMetrics.vital_signs.heart_rate} bpm</p>
                </div>
              </>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-500">Activity Level</p>
              <p className="text-lg font-medium">{patientMetrics.activity_level}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Sleep Quality</p>
              <p className="text-lg font-medium">{patientMetrics.sleep_quality}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caregiver Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caregiverReports.map((report) => (
              <div key={report.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {report.profiles?.first_name} {report.profiles?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.recorded_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {report.profiles?.user_type}
                  </span>
                </div>
                <p className="text-gray-700">{report.metric_value.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Message to Care Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={3}
            />
            <Button onClick={sendMessage}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};