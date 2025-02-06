
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Check, Clock, X } from "lucide-react";
import { MedicationVerificationControls } from "./MedicationVerificationControls";

interface MedicationVerification {
  id: string;
  verification_time: string;
  photo_url: string | null;
  status: string | null;
}

export const MedicationVerificationHistory = ({ groupId }: { groupId: string }) => {
  const [verifications, setVerifications] = useState<MedicationVerification[]>([]);

  useEffect(() => {
    const fetchVerifications = async () => {
      const { data, error } = await supabase
        .from('medication_verifications')
        .select('*')
        .eq('group_id', groupId)
        .order('verification_time', { ascending: false });

      if (!error && data) {
        setVerifications(data);
      }
    };

    fetchVerifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('medication-verifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_verifications',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'verified':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(verification.status)}
                <div>
                  <p className="font-medium">
                    {new Date(verification.verification_time).toLocaleString()}
                  </p>
                  {verification.photo_url && (
                    <a
                      href={verification.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Photo
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MedicationVerificationControls 
                  verificationId={verification.id}
                  currentStatus={verification.status}
                />
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    verification.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : verification.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {verification.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
          {verifications.length === 0 && (
            <p className="text-center text-muted-foreground">
              No verifications recorded yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
