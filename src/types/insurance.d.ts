
export interface ProviderSearchFilters {
  specialty?: string;
  locations?: string[];
  network_status?: 'in-network' | 'out-of-network';
  accepting_new_patients?: boolean;
  distance: number;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  provider_name: string;
  specialty: string;
  network_status: 'in-network' | 'out-of-network';
  accepting_new_patients: boolean;
  locations: Array<{
    address: string;
    phone: string;
  }>;
  rating?: number;
}
