
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MedicationLogBase } from "@/types/supabase";

interface SupervisorPanelProps {
  groupId: string;
}

export const SupervisorPanel = ({ groupId }: SupervisorPanelProps) => {
  const { data: pendingVerifications } = useQuery({
    queryKey: ['pendingVerifications', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
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
      return data as MedicationLogBase[];
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
        {pendingVerifications?.map((log: MedicationLogBase) => (
          <div key={log.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={log.photo_verification_url} />
                <AvatarFallback>UV</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {log.medication_schedule?.medication_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Taken at: {new Date(log.taken_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Badge>
              <Badge variant="outline" className="text-red-500">
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
