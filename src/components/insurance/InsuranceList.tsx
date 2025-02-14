
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const InsuranceList = () => {
  const { data: insurances } = useQuery({
    queryKey: ['userInsurance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (
            name,
            provider,
            type,
            coverage_details
          )
        `)
        .eq('user_id', user.id);

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
              className="flex flex-col space-y-3 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{insurance.insurance_plan?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Provider: {insurance.insurance_plan?.provider}
                  </p>
                </div>
                <Badge
                  variant={insurance.verification_status === 'verified' ? 'default' : 'secondary'}
                >
                  {insurance.verification_status}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Policy #: {insurance.policy_number}</p>
                {insurance.group_number && <p>Group #: {insurance.group_number}</p>}
                <p>Type: {insurance.insurance_plan?.type}</p>
              </div>
              
              {insurance.insurance_plan?.coverage_details && (
                <div className="border-t pt-3 mt-2">
                  <h5 className="text-sm font-medium mb-2">Coverage Details</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(insurance.insurance_plan.coverage_details).map(([key, value]) => (
                      <div key={key} className="flex items-center text-sm">
                        <Badge variant={value ? "default" : "secondary"} className="mr-2">
                          {value ? "✓" : "✗"}
                        </Badge>
                        {key.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
