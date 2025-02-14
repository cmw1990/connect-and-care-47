
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceDeductiblesCardProps {
  insuranceId: string;
}

export const InsuranceDeductiblesCard = ({ insuranceId }: InsuranceDeductiblesCardProps) => {
  const currentYear = new Date().getFullYear();

  const { data: deductibles } = useQuery({
    queryKey: ['deductibles', insuranceId, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_deductibles')
        .select('*')
        .eq('insurance_id', insuranceId)
        .eq('year', currentYear);

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deductibles Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deductibles?.map(deductible => {
          const progress = (deductible.met_amount / deductible.total_amount) * 100;
          const remaining = deductible.total_amount - deductible.met_amount;

          return (
            <div key={deductible.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{deductible.deductible_type}</span>
                <span>${deductible.met_amount.toFixed(2)} / ${deductible.total_amount.toFixed(2)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                ${remaining.toFixed(2)} remaining for {currentYear}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
