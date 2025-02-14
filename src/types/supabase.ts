
import { Database } from '@/integrations/supabase/types'

export type DatabaseSchema = Database['public']['Tables']

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
  insurance_providers: {
    Row: InsuranceProvider;
    Insert: Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<InsuranceProvider>;
  };
}

export interface InsuranceProvider {
  id: string;
  provider_name: string;
  specialty: string;
  network_status: 'in-network' | 'out-of-network';
  location: {
    address: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  rating?: number;
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
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

// Custom type guard for insurance provider location
export function isValidProviderLocation(obj: any): obj is InsuranceProvider['location'] {
  return obj && typeof obj.address === 'string';
}

// Custom type for Supabase query responses
export type PostgrestResponse<T> = {
  data: T[] | null;
  error: Error | null;
};

// Type for query filters
export interface QueryFilter {
  column: string;
  operator: string;
  value: any;
}
