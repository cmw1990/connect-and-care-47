
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface MedicationVerificationPanelProps {
  groupId: string;
}

export const MedicationVerificationPanel = ({ groupId }: MedicationVerificationPanelProps) => {
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['medicationVerifications', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medication_schedules (
            medication_name,
            dosage
          ),
          administered_by_profile: profiles!administered_by (
            first_name,
            last_name
          ),
          verified_by_profile: profiles!verified_by (
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending_verification')
        .order('administered_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleVerification = async (logId: string, verified: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('medication_logs')
      .update({
        status: verified ? 'taken' : 'rejected',
        verified_by: user.id
      })
      .eq('id', logId);

    if (error) {
      console.error('Error verifying medication:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Verifications</h3>

      <div className="grid gap-4">
        {verifications?.map((verification) => (
          <Card key={verification.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">
                    {verification.medication_schedules.medication_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {verification.medication_schedules.dosage}
                  </p>
                  <p className="text-sm mt-2">
                    Administered by: {verification.administered_by_profile.first_name}{' '}
                    {verification.administered_by_profile.last_name}
                  </p>
                </div>

                <div className="text-sm text-right">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(verification.administered_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  {verification.photo_verification_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(verification.photo_verification_url)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      View Photo
                    </Button>
                  )}
                </div>
              </div>

              {verification.symptoms?.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Reported Symptoms:</h5>
                  <div className="flex flex-wrap gap-2">
                    {verification.symptoms.map((symptom: string) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleVerification(verification.id, false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerification(verification.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {verifications?.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                <p>No pending verifications</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
