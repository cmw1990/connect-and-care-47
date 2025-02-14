
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

interface InsuranceBenefit {
  id: string;
  plan_id: string;
  benefit_name: string;
  coverage_percentage: number;
  annual_limit: number | null;
  requires_preauthorization: boolean;
  waiting_period_days: number;
}

interface InsurancePlanBenefitsTableProps {
  planId: string;
}

export const InsurancePlanBenefitsTable = ({ planId }: InsurancePlanBenefitsTableProps) => {
  const { data: benefits } = useQuery<InsuranceBenefit[]>({
    queryKey: ['planBenefits', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_plan_benefits')
        .select('*')
        .eq('plan_id', planId);

      if (error) throw error;
      return data;
    }
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Benefit</TableHead>
          <TableHead>Coverage</TableHead>
          <TableHead>Annual Limit</TableHead>
          <TableHead>Pre-Auth</TableHead>
          <TableHead>Waiting Period</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {benefits?.map((benefit) => (
          <TableRow key={benefit.id}>
            <TableCell className="font-medium">{benefit.benefit_name}</TableCell>
            <TableCell>{benefit.coverage_percentage}%</TableCell>
            <TableCell>
              {benefit.annual_limit ? `$${benefit.annual_limit.toFixed(2)}` : 'No limit'}
            </TableCell>
            <TableCell>
              {benefit.requires_preauthorization ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </TableCell>
            <TableCell>
              {benefit.waiting_period_days > 0
                ? `${benefit.waiting_period_days} days`
                : 'None'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
