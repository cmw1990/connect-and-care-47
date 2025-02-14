
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInsuranceCoverage = (serviceType: string) => {
  const { data: coverageInfo, isLoading } = useQuery({
    queryKey: ['insuranceCoverage', serviceType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userInsurance, error: insuranceError } = await supabase
        .from('user_insurance')
        .select(`
          id,
          insurance_plan:insurance_plan_id (
            id,
            name,
            type,
            covered_services,
            auto_verification
          )
        `)
        .eq('user_id', user.id)
        .eq('verification_status', 'verified')
        .single();

      if (insuranceError) throw insuranceError;

      const isCovered = userInsurance?.insurance_plan?.covered_services?.includes(serviceType);
      const canAutoProcess = userInsurance?.insurance_plan?.auto_verification;

      return {
        isInsured: !!userInsurance,
        isCovered,
        canAutoProcess,
        insuranceId: userInsurance?.id,
        planDetails: userInsurance?.insurance_plan
      };
    }
  });

  return {
    coverageInfo,
    isLoading
  };
};
