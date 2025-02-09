
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, AlertCircle } from "lucide-react";
import type { MedicationSupervisionSummary, MedicationLog } from "@/types/medication";

interface SupervisorPanelProps {
  groupId: string;
  data: MedicationSupervisionSummary | null;
}

export const SupervisorPanel = ({ groupId, data }: SupervisorPanelProps) => {
  const { data: pendingVerifications } = useQuery({
    queryKey: ['pendingVerifications', groupId],
    queryFn: async () => {
      type DBMedicationLog = Omit<MedicationLog, 'taken_at'> & {
        administered_at: string;
      };

      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medication_schedules (
            medication_name,
            dosage
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending_verification')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our MedicationLog type
      return (data as DBMedicationLog[]).map(log => ({
        ...log,
        taken_at: log.administered_at
      }));
    }
  });

  const handleVerification = async (logId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('medication_logs')
      .update({
        verification_status: status,
        status: status === 'approved' ? 'taken' : 'rejected',
        verified_at: new Date().toISOString()
      })
      .eq('id', logId);

    if (error) {
      console.error('Error updating verification status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data?.total_medications ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total Medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data?.approved_medications ?? 0}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Math.round(data?.avg_verification_time_minutes ?? 0)}m</div>
            <p className="text-xs text-muted-foreground">Avg. Verification Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h3 className="text-lg font-medium">Pending Verifications</h3>
        </div>
        <div className="divide-y">
          {pendingVerifications?.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {log.medication_schedules?.medication_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {log.medication_schedules?.dosage} - {new Date(log.taken_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => handleVerification(log.id, 'approved')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleVerification(log.id, 'rejected')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!pendingVerifications || pendingVerifications.length === 0) && (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <AlertCircle className="mr-2 h-4 w-4" />
              No pending verifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
