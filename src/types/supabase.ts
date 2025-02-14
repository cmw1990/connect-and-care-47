
import { Database } from '@/integrations/supabase/types'

export type Tables = Database['public']['Tables']

// Network Providers
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

// Analytics
export interface InsuranceAnalytics {
  id: string;
  user_id: string;
  type: string;
  value: number;
  period: string;
  created_at: string;
}

// Deductibles
export interface InsuranceDeductible {
  id: string;
  insurance_id: string;
  deductible_type: string;
  total_amount: number;
  met_amount: number;
  year: number;
  created_at: string;
}

// Notifications
export interface InsuranceNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Plan Benefits
export interface InsurancePlanBenefit {
  id: string;
  plan_id: string;
  name: string;
  coverage_percentage: number;
  requires_preauth: boolean;
  created_at: string;
}
