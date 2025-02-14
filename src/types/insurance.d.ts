
export interface InsuranceUser {
  id: string;
  insurance_plan_id: string;
  user_id: string;
  member_id: string;
  group_number?: string;
  status: 'active' | 'inactive' | 'pending';
  coverage_start_date: string;
  coverage_end_date?: string;
  insurance_plan: InsurancePlan;
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  type: string;
  coverage_details: Record<string, boolean>;
  network_type: 'HMO' | 'PPO' | 'EPO' | 'POS';
  auto_verification: boolean;
  covered_services: Record<string, any>;
}

export interface InsuranceClaim {
  id: string;
  insurance_id: string;
  service_date: string;
  provider: string;
  service_type: string;
  claim_amount: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied';
  submitted_at: string;
  updated_at: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  specialty: string;
  network_status: 'in-network' | 'out-of-network';
  accepting_new_patients: boolean;
  locations: Array<{
    address: string;
    phone: string;
  }>;
}

export interface InsuranceAnalytics {
  id: string;
  user_id: string;
  metrics: {
    claims_submitted: number;
    claims_approved: number;
    total_cost: number;
    out_of_pocket: number;
    created_at: string;
  };
}

export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: string;
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface InsuranceDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
  uploaded_at: string;
}

export interface InsuranceNotification {
  id: string;
  user_id: string;
  type: 'claim_update' | 'document_status' | 'coverage_alert' | 'preauth_required';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface InsuranceBenefit {
  id: string;
  plan_id: string;
  benefit_name: string;
  coverage_percentage: number;
  annual_limit?: number;
  requires_preauthorization: boolean;
  waiting_period_days: number;
  created_at: string;
  updated_at: string;
}

export interface CoverageUtilization {
  id: string;
  insurance_id: string;
  benefit_id: string;
  utilized_amount: number;
  year: number;
  last_updated: string;
}
