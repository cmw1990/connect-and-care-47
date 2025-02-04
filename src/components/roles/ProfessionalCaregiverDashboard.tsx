import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Clock, Activity } from "lucide-react";
import type { CareReport } from '@/types/roles';

export const ProfessionalCaregiverDashboard = ({ groupId }: { groupId: string }) => {
  const [reports, setReports] = useState<CareReport[]>([]);
  const [newReport, setNewReport] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [groupId]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('care_analytics')
        .select(`
          id,
          recorded_at,
          metric_value,
          created_by,
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .eq('group_id', groupId)
        .eq('metric_type', 'caregiver_report')
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const submitReport = async () => {
    if (!newReport.trim()) return;

    try {
      const { error } = await supabase
        .from('care_analytics')
        .insert({
          group_id: groupId,
          metric_type: 'caregiver_report',
          metric_value: {
            notes: newReport.trim(),
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report submitted successfully",
      });

      setNewReport('');
      await fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Submit Care Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={newReport}
              onChange={(e) => setNewReport(e.target.value)}
              placeholder="Enter your care report details..."
              rows={4}
            />
            <Button onClick={submitReport}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report: any) => (
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
                </div>
                <p className="text-gray-700">{report.metric_value.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};