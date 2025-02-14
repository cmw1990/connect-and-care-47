
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Mail } from "lucide-react";

export const InsuranceProviderSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data: providers, isLoading } = useQuery({
    queryKey: ['networkProviders', searchTerm, specialty],
    queryFn: async () => {
      let query = supabase
        .from('insurance_network_providers')
        .select('*');

      if (searchTerm) {
        query = query.ilike('provider_name', `%${searchTerm}%`);
      }

      if (specialty) {
        query = query.eq('specialty', specialty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!searchTerm || !!specialty
  });

  const { data: specialties } = useQuery({
    queryKey: ['providerSpecialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_network_providers')
        .select('specialty')
        .not('specialty', 'is', null)
        .distinct();

      if (error) throw error;
      return data.map(s => s.specialty);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find In-Network Providers</CardTitle>
        <CardDescription>
          Search for healthcare providers in your insurance network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">All Specialties</option>
              {specialties?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="animate-pulse">Searching providers...</div>
            ) : providers?.map((provider) => (
              <div
                key={provider.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{provider.provider_name}</h3>
                    {provider.specialty && (
                      <Badge variant="secondary">{provider.specialty}</Badge>
                    )}
                  </div>
                </div>

                {provider.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {typeof provider.location === 'string' 
                        ? provider.location 
                        : `${provider.location.address}, ${provider.location.city}`}
                    </span>
                  </div>
                )}

                {provider.contact_info && (
                  <div className="space-y-1 text-sm">
                    {provider.contact_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{provider.contact_info.phone}</span>
                      </div>
                    )}
                    {provider.contact_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{provider.contact_info.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {providers?.length === 0 && (
              <p className="text-center text-muted-foreground">
                No providers found matching your search criteria.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
