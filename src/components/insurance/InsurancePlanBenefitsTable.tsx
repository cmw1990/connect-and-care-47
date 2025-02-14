
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
import { InsuranceBenefitsSkeleton } from "@/components/ui/skeletons/InsuranceBenefitsSkeleton";

interface InsuranceBenefit {
  id: string;
  plan_id: string;
  benefit_name: string;
  coverage_percentage: number;
  annual_limit: number | null;
  requires_preauthorization: boolean;
  waiting_period_days: number;
  created_at: string;
  updated_at: string;
}

interface InsurancePlanBenefitsTableProps {
  planId: string;
}

export const InsurancePlanBenefitsTable = ({ planId }: InsurancePlanBenefitsTableProps) => {
  const { data: benefits, isLoading } = useQuery({
    queryKey: ['planBenefits', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_plan_benefits')
        .select('id, plan_id, benefit_name, coverage_percentage, annual_limit, requires_preauthorization, waiting_period_days, created_at, updated_at')
        .eq('plan_id', planId);

      if (error) throw error;
      return data as InsuranceBenefit[];
    }
  });

  if (isLoading) {
    return <InsuranceBenefitsSkeleton />;
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="dark:bg-gray-800 dark:hover:bg-gray-800">
            <TableHead className="dark:text-gray-300">Benefit</TableHead>
            <TableHead className="dark:text-gray-300">Coverage</TableHead>
            <TableHead className="dark:text-gray-300">Annual Limit</TableHead>
            <TableHead className="dark:text-gray-300">Pre-Auth</TableHead>
            <TableHead className="dark:text-gray-300">Waiting Period</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benefits?.map((benefit) => (
            <TableRow key={benefit.id} className="dark:bg-gray-900 dark:hover:bg-gray-800">
              <TableCell className="font-medium dark:text-gray-300">{benefit.benefit_name}</TableCell>
              <TableCell className="dark:text-gray-300">{benefit.coverage_percentage}%</TableCell>
              <TableCell className="dark:text-gray-300">
                {benefit.annual_limit ? `$${benefit.annual_limit.toFixed(2)}` : 'No limit'}
              </TableCell>
              <TableCell>
                {benefit.requires_preauthorization ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {benefit.waiting_period_days > 0
                  ? `${benefit.waiting_period_days} days`
                  : 'None'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
