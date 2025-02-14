
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface InsuranceCardProps {
  insurance: {
    policy_number: string;
    group_number?: string | null;
    coverage_start_date: string;
    coverage_end_date?: string | null;
    insurance_plan: {
      name: string;
      provider: string;
      type: string;
    };
  };
}

export const InsuranceCard = ({ insurance }: InsuranceCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{insurance.insurance_plan.provider}</h3>
              <p className="text-blue-100">{insurance.insurance_plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Type</p>
              <p className="font-medium">{insurance.insurance_plan.type}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-blue-100">Policy Number</p>
              <p className="font-mono text-lg">{insurance.policy_number}</p>
            </div>

            {insurance.group_number && (
              <div>
                <p className="text-sm text-blue-100">Group Number</p>
                <p className="font-mono">{insurance.group_number}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm pt-2">
            <div>
              <p className="text-blue-100">Valid From</p>
              <p>{format(new Date(insurance.coverage_start_date), 'MM/dd/yyyy')}</p>
            </div>
            {insurance.coverage_end_date && (
              <div className="text-right">
                <p className="text-blue-100">Valid Until</p>
                <p>{format(new Date(insurance.coverage_end_date), 'MM/dd/yyyy')}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
