
import { InsurancePlanBenefitsTable } from "@/components/insurance/InsurancePlanBenefitsTable";
import { InsuranceDeductiblesCard } from "@/components/insurance/InsuranceDeductiblesCard";
import { InsuranceCard } from "@/components/insurance/InsuranceCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Coverage() {
  const { data: activeInsurance } = useQuery({
    queryKey: ['activeInsurance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_insurance')
        .select('*, insurance_plan:insurance_plan_id(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Coverage Details</h1>
      
      {activeInsurance && (
        <>
          <InsuranceCard insurance={activeInsurance} />
          <div className="grid gap-6 md:grid-cols-2">
            <InsuranceDeductiblesCard insuranceId={activeInsurance.id} />
            <InsurancePlanBenefitsTable planId={activeInsurance.insurance_plan.id} />
          </div>
        </>
      )}
    </div>
  );
}
