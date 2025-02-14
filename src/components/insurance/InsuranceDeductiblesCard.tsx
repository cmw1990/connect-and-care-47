
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { InsuranceDeductiblesSkeleton } from "@/components/ui/skeletons/InsuranceDeductiblesSkeleton";

interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: 'individual' | 'family';
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
  updated_at: string;
}

interface InsuranceDeductiblesCardProps {
  insuranceId: string;
}

export const InsuranceDeductiblesCard = ({ insuranceId }: InsuranceDeductiblesCardProps) => {
  const currentYear = new Date().getFullYear();

  const { data: deductibles, isLoading } = useQuery({
    queryKey: ['deductibles', insuranceId, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_deductibles')
        .select('id, insurance_id, deductible_type, total_amount, met_amount, year, created_at, updated_at')
        .eq('insurance_id', insuranceId)
        .eq('year', currentYear);

      if (error) throw error;
      return data as InsuranceDeductible[];
    }
  });

  if (isLoading) {
    return <InsuranceDeductiblesSkeleton />;
  }

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Deductibles Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deductibles?.map(deductible => {
          const progress = (deductible.met_amount / deductible.total_amount) * 100;
          const remaining = deductible.total_amount - deductible.met_amount;

          return (
            <div key={deductible.id} className="space-y-2">
              <div className="flex justify-between text-sm dark:text-gray-300">
                <span className="capitalize">{deductible.deductible_type}</span>
                <span>${deductible.met_amount.toFixed(2)} / ${deductible.total_amount.toFixed(2)}</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 dark:bg-gray-700" 
              />
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                ${remaining.toFixed(2)} remaining for {currentYear}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
