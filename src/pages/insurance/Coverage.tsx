
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InsuranceDeductiblesCard } from "@/components/insurance/InsuranceDeductiblesCard";
import { InsurancePlanBenefitsTable } from "@/components/insurance/InsurancePlanBenefitsTable";

export default function Coverage() {
  const { data: activePlan } = useQuery({
    queryKey: ['activePlan'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      {activePlan && (
        <>
          <InsuranceDeductiblesCard insuranceId={activePlan.id} />
          <InsurancePlanBenefitsTable planId={activePlan.insurance_plan.id} />
        </>
      )}
    </div>
  );
}
