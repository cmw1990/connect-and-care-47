
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { MedicationLogBase } from "./MedicationLogBase";
import type { MedicationSupervisionSummary } from "@/types/medication";

interface SupervisorPanelProps {
  groupId: string;
  supervisionData?: MedicationSupervisionSummary;
}

export const SupervisorPanel = ({ groupId, supervisionData }: SupervisorPanelProps) => {
  const { data: pendingVerifications } = useQuery({
    queryKey: ['pendingVerifications', groupId],
    queryFn: async () => {
      try {
        const { data, error } = await supabaseClient
          .from('medication_logs')
          .select(`
            id,
            schedule_id,
            taken_at,
            administered_at,
            status,
            notes,
            photo_verification_url,
            medication_schedule:medication_schedules(*)
          `)
          .eq('group_id', groupId)
          .eq('status', 'pending_verification')
          .order('administered_at', { ascending: false });

        if (error) throw error;
        
        // Transform to ensure correct typing
        const transformedData: MedicationLogBase[] = data ? data.map(item => ({
          id: item.id,
          schedule_id: item.schedule_id,
          taken_at: item.taken_at,
          administered_at: item.administered_at,
          status: item.status as 'taken' | 'missed' | 'pending' | 'pending_verification' | 'rejected',
          notes: item.notes,
          photo_verification_url: item.photo_verification_url,
          medication_schedule: item.medication_schedule
        })) : [];
        
        return transformedData;
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
        return [];
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Medication Supervision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!pendingVerifications || pendingVerifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No pending medication verifications
          </div>
        ) : (
          pendingVerifications.map((log) => (
            <div key={log.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={log.photo_verification_url} />
                  <AvatarFallback>UV</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {log.medication_schedule?.medication_name || 'Unknown Medication'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taken at: {new Date(log.taken_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-500 cursor-pointer hover:bg-green-50">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Badge>
                <Badge variant="outline" className="text-red-500 cursor-pointer hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
