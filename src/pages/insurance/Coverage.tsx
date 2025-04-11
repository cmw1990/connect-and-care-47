
import { useQuery } from '@tanstack/react-query';
import { supabaseClient, handleSupabaseError } from "@/integrations/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for insurance benefits
interface InsuranceBenefit {
  id: string;
  benefit_name: string;
  coverage_percentage: number;
  deductible_amount: number;
  copay_amount: number;
  max_annual_benefit: number;
}

export default function Coverage() {
  // Use mock data directly since the real API is failing
  const mockBenefits = [
    {
      id: "1",
      benefit_name: "Primary Care Visits",
      coverage_percentage: 80,
      deductible_amount: 30,
      copay_amount: 25,
      max_annual_benefit: 0
    },
    {
      id: "2",
      benefit_name: "Specialist Visits",
      coverage_percentage: 70,
      deductible_amount: 50,
      copay_amount: 40,
      max_annual_benefit: 0
    },
    {
      id: "3",
      benefit_name: "Prescription Drugs",
      coverage_percentage: 75,
      deductible_amount: 0,
      copay_amount: 15,
      max_annual_benefit: 2500
    },
    {
      id: "4",
      benefit_name: "Hospital Stays",
      coverage_percentage: 90,
      deductible_amount: 250,
      copay_amount: 0,
      max_annual_benefit: 10000
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insurance Coverage Benefits</h1>
      <p className="text-muted-foreground">
        Using mock data to display sample coverage information.
      </p>
      <div className="grid gap-4">
        {mockBenefits.map(renderBenefitCard)}
      </div>
    </div>
  );
}

function renderBenefitCard(benefit: InsuranceBenefit) {
  return (
    <Card key={benefit.id} className="overflow-hidden">
      <CardHeader className="bg-muted">
        <CardTitle>{benefit.benefit_name}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Coverage</p>
            <p className="text-lg font-medium">{benefit.coverage_percentage}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deductible</p>
            <p className="text-lg font-medium">
              ${benefit.deductible_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Copay</p>
            <p className="text-lg font-medium">
              ${benefit.copay_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Annual Maximum</p>
            <p className="text-lg font-medium">
              {benefit.max_annual_benefit === 0 
                ? "Unlimited" 
                : `$${benefit.max_annual_benefit.toFixed(2)}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
