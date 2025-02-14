
export interface Tables {
  insurance_analytics: {
    Row: InsuranceAnalytics;
    Insert: Omit<InsuranceAnalytics, 'id' | 'created_at'>;
    Update: Partial<InsuranceAnalytics>;
  };
  insurance_deductibles: {
    Row: InsuranceDeductible;
    Insert: Omit<InsuranceDeductible, 'id' | 'created_at'>;
    Update: Partial<InsuranceDeductible>;
  };
  insurance_notifications: {
    Row: InsuranceNotification;
    Insert: Omit<InsuranceNotification, 'id' | 'created_at'>;
    Update: Partial<InsuranceNotification>;
  };
  insurance_plan_benefits: {
    Row: InsurancePlanBenefit;
    Insert: Omit<InsurancePlanBenefit, 'id' | 'created_at'>;
    Update: Partial<InsurancePlanBenefit>;
  };
  insurance_preauthorizations: {
    Row: InsurancePreauthorization;
    Insert: Omit<InsurancePreauthorization, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<InsurancePreauthorization>;
  };
}

export interface InsuranceAnalytics {
  id: string;
  user_id: string;
  type: string;
  value: number;
  period: string;
  created_at: string;
}

export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: string;
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
}

export interface InsuranceNotification {
  id: string;
  user_id: string;
  type: 'claim_update' | 'document_status' | 'coverage_alert' | 'preauth_required';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface InsurancePlanBenefit {
  id: string;
  plan_id: string;
  name: string;
  coverage_percentage: number;
  requires_preauth: boolean;
  created_at: string;
}

export interface InsurancePreauthorization {
  id: string;
  insurance_id: string;
  service_type: string;
  status: string;
  supporting_documents?: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderSearchFilters {
  specialty?: string;
  distance?: string;
  networkStatus?: 'all' | 'in-network' | 'out-of-network';
}

export interface InsuranceDocument {
  id: string;
  user_id: string;
  file_url: string;
  document_type: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
  uploaded_at: string;
}
