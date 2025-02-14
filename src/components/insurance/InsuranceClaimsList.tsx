
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const InsuranceClaimsList = () => {
  const { data: claims, isLoading } = useQuery({
    queryKey: ['insuranceClaims'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('insurance_claims')
        .select(`
          *,
          insurance:insurance_id (
            insurance_plan:insurance_plan_id (
              name,
              provider
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'denied':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading claims...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Claims</CardTitle>
        <CardDescription>
          View and track your insurance claims
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {claims?.map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col space-y-3 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {claim.insurance?.insurance_plan?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Provider: {claim.insurance?.insurance_plan?.provider}
                  </p>
                </div>
                <Badge className={getStatusColor(claim.status)}>
                  {claim.status}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Service Type: {claim.service_type}</p>
                <p>Amount: ${claim.claim_amount}</p>
                <p>Service Date: {format(new Date(claim.service_date), 'PPP')}</p>
                <p>Submitted: {format(new Date(claim.created_at), 'PPP')}</p>
              </div>
              
              {claim.processing_notes && claim.processing_notes.length > 0 && (
                <div className="border-t pt-3 mt-2">
                  <h5 className="text-sm font-medium mb-2">Processing Notes</h5>
                  <ul className="text-sm space-y-1">
                    {claim.processing_notes.map((note: string, index: number) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {(!claims || claims.length === 0) && (
            <p className="text-center text-muted-foreground">
              No insurance claims found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
