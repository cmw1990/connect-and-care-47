
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const InsuranceList = () => {
  const { data: insurances } = useQuery({
    queryKey: ['userInsurance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (
            name,
            provider,
            type
          )
        `);

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Insurance Plans</CardTitle>
        <CardDescription>
          View and manage your insurance information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insurances?.map((insurance) => (
            <div
              key={insurance.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{insurance.insurance_plan?.provider}</h4>
                <p className="text-sm text-muted-foreground">
                  Policy #: {insurance.policy_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Group #: {insurance.group_number}
                </p>
              </div>
              <Badge
                variant={insurance.verification_status === 'verified' ? 'default' : 'secondary'}
              >
                {insurance.verification_status}
              </Badge>
            </div>
          ))}

          {(!insurances || insurances.length === 0) && (
            <p className="text-center text-muted-foreground">
              No insurance plans found. Add your insurance details to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
