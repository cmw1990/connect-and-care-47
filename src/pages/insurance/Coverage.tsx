
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { InsuranceBenefitRow } from '@/types/supabase';

export default function Coverage() {
  const { data: benefits } = useQuery({
    queryKey: ['insurance-benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_benefits')
        .select('*');

      if (error) throw error;
      return data as InsuranceBenefitRow[];
    }
  });

  return (
    <div>
      <h1>Insurance Coverage Benefits</h1>
      {benefits ? (
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit.id}>{benefit.benefit_name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading benefits...</p>
      )}
    </div>
  );
}
