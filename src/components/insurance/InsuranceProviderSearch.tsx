import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { InsuranceProvider, InsuranceNetworkProviderRow, ProviderSearchFilters } from '@/types/insurance';

export const InsuranceProviderSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProviderSearchFilters>({
    specialty: "",
    distance: 10,
    network_status: "in-network",
  });

  const { data: providers, isLoading } = useQuery({
    queryKey: ['insurance-providers', searchTerm, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_network_providers')
        .select('*')
        .ilike('provider_name', `%${searchTerm}%`)
        .eq('specialty', filters.specialty || null)
        .eq('network_status', filters.network_status || null)
        .lte('distance', filters.distance)
        .returns<InsuranceNetworkProviderRow[]>();

      if (error) throw error;

      return data.map((provider): InsuranceProvider => ({
        id: provider.id,
        name: provider.provider_name,
        provider_name: provider.provider_name,
        specialty: provider.specialty,
        network_status: provider.network_status,
        accepting_new_patients: provider.accepting_new_patients,
        locations: [{
          address: provider.location?.address || '',
          phone: provider.contact_info?.phone || ''
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
