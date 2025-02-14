
export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: 'individual' | 'family';
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface InsuranceBenefit {
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

export interface InsuranceProvider {
  id: string;
  name: string;
  specialty: string | null;
  accepting_new_patients: boolean;
  insurance_plan_providers: Array<{
    network_status: 'in-network' | 'out-of-network';
  }>;
}

export interface InsuranceDocument {
  id: string;
  user_id: string;
  insurance_id: string;
  document_type: string;
  file_url: string;
  metadata: Record<string, any>;
  uploaded_at: string;
}
