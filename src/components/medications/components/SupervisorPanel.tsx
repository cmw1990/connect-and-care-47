
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabaseClient } from '@/integrations/supabaseClient';
import { MedicationLogBase } from "@/components/medications/components/MedicationLogBase";

interface SupervisorPanelProps {
  groupId: string;
  supervisionData?: any;
}

export const SupervisorPanel: React.FC<SupervisorPanelProps> = ({
  groupId,
  supervisionData
}) => {
  const [pendingLogs, setPendingLogs] = useState<MedicationLogBase[]>([]);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['pending-medication-logs', groupId],
    queryFn: async () => {
      try {
        const { data, error } = await supabaseClient
          .from('medication_logs')
          .select('*, medication_schedule:schedule_id(*)')
          .eq('status', 'pending_verification')
          .order('taken_at', { ascending: false });
          
        if (error) throw error;
        
        return data as MedicationLogBase[];
      } catch (error) {
        console.error('Error fetching pending verification logs:', error);
        return [] as MedicationLogBase[];
      }
    }
  });

  useEffect(() => {
    if (logs) {
      setPendingLogs(logs);
    }
  }, [logs]);

  const handleVerify = async (logId: string, verified: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('medication_logs')
        .update({
          status: verified ? 'taken' : 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: 'current-user' // Would be replaced with actual user ID
        })
        .eq('id', logId);
        
      if (error) throw error;
      
      // Refresh the data
      refetch();
      
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pendingLogs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medication Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">No Pending Verifications</h3>
            <p className="text-muted-foreground mt-2">
              All medications have been verified. Check back later for new verifications.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Verifications ({pendingLogs.length})</h3>
      
      {pendingLogs.map((log) => (
        <Card key={log.id} className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium">
                  {log.medication_schedule?.medication_name || 'Unknown Medication'}
                </h4>
                <Badge variant="outline">
                  {log.medication_schedule?.dosage || 'Unknown dosage'}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Taken at: {new Date(log.taken_at).toLocaleString()}</p>
                <p>Administered by: {log.administered_by || 'Self'}</p>
                {log.notes && <p>Notes: {log.notes}</p>}
              </div>
              
              {log.photo_verification_url && (
                <div className="mt-4">
                  <img 
                    src={log.photo_verification_url} 
                    alt="Medication verification" 
                    className="max-w-full h-auto rounded-md border"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center space-y-2">
              <Button 
                onClick={() => handleVerify(log.id, true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
              
              <Button 
                onClick={() => handleVerify(log.id, false)}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
