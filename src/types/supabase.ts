
import { Database } from '@/integrations/supabase/types'

export type Tables = Database['public']['Tables']
export type InsuranceProvider = Tables['insurance_network_providers']['Row']
export type InsuranceAnalytics = Tables['insurance_analytics']['Row']

export interface ProviderLocation {
  address: string;
  coordinates?: [number, number];
  city?: string;
  state?: string;
  zip?: string;
}

export interface ProviderSearchFilters {
  specialty?: string;
  distance?: string;
  networkStatus?: 'all' | 'in-network' | 'out-of-network';
}
