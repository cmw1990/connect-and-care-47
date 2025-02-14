
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const InsuranceVerificationHistory = () => {
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['insuranceVerifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('insurance_verification_history')
        .select(`
          *,
          insurance:insurance_id (
            policy_number,
            insurance_plan:insurance_plan_id (
              name,
              provider
            )
          )
        `)
        .order('verification_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading verification history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification History</CardTitle>
        <CardDescription>
          Track your insurance verification status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {verifications?.map((verification) => (
            <div
              key={verification.id}
              className="flex flex-col space-y-3 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {verification.insurance?.insurance_plan?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Policy: {verification.insurance?.policy_number}
                  </p>
                </div>
                <Badge variant={verification.status === 'verified' ? 'default' : 'secondary'}>
                  {verification.status}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Provider: {verification.insurance?.insurance_plan?.provider}</p>
                <p>Verified On: {format(new Date(verification.verification_date), 'PPP')}</p>
                <p>Method: {verification.verification_method || 'Standard verification'}</p>
              </div>

              {verification.verification_details && (
                <div className="border-t pt-3 mt-2">
                  <h5 className="text-sm font-medium mb-2">Additional Details</h5>
                  <div className="text-sm">
                    {typeof verification.verification_details === 'string'
                      ? verification.verification_details
                      : JSON.stringify(verification.verification_details, null, 2)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {(!verifications || verifications.length === 0) && (
            <p className="text-center text-muted-foreground">
              No verification history found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
