
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Claims() {
  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('insurance_claims')
        .select(`
          *,
          insurance:insurance_id (
            insurance_plan:insurance_plan_id (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Claims History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {claims?.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{claim.service_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(claim.service_date), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${claim.claim_amount}</p>
                  <Badge 
                    variant={
                      claim.status === 'approved' 
                        ? 'default' 
                        : claim.status === 'denied' 
                        ? 'destructive' 
                        : 'secondary'
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
