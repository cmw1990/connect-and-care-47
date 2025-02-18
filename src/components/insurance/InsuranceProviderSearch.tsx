
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { InsuranceProvider, ProviderSearchFilters, InsuranceNetworkProviderRow } from '@/types/insurance';

export const InsuranceProviderSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProviderSearchFilters>({
    specialty: "",
    distance: 10,
    network_status: "in-network",
  });

  const { data: providers, isLoading } = useQuery<InsuranceProvider[]>({
    queryKey: ['insurance-providers', searchTerm, filters] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_network_providers')
        .select('*')
        .ilike('provider_name', `%${searchTerm}%`)
        .eq('specialty', filters.specialty || null)
        .eq('network_status', filters.network_status || null)
        .limit(50);

      if (error) throw error;

      return (data || []).map((provider: InsuranceNetworkProviderRow): InsuranceProvider => ({
        id: provider.id,
        name: provider.provider_name,
        provider_name: provider.provider_name,
        specialty: provider.specialty || '',
        network_status: provider.network_status === 'in-network' ? 'in-network' : 'out-of-network',
        accepting_new_patients: provider.accepting_new_patients || false,
        locations: [{
          address: typeof provider.location === 'object' && provider.location !== null ? 
                  (provider.location as { address: string }).address || '' : '',
          phone: typeof provider.contact_info === 'object' && provider.contact_info !== null ? 
                 (provider.contact_info as { phone: string }).phone || '' : ''
        }]
      }));
    }
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search for providers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : providers ? (
        <ul>
          {providers.map((provider) => (
            <li key={provider.id}>
              {provider.name} - {provider.specialty}
            </li>
          ))}
        </ul>
      ) : (
        <p>No providers found.</p>
      )}
    </div>
  );
};
