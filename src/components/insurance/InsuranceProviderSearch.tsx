import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { InsuranceProvider, ProviderSearchFilters } from "@/types/insurance";

export const InsuranceProviderSearch = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProviderSearchFilters>({
    specialty: "",
    distance: 10,
    network_status: "in-network",
  });

  const { data: providers, isLoading } = useQuery({
    queryKey: ['insurance-providers', searchTerm, filters],
    queryFn: async () => {
      let query = supabase
        .from('insurance_network_providers')
        .select()
        .ilike('provider_name', `%${searchTerm}%`);

      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }

      if (filters.network_status) {
        query = query.eq('network_status', filters.network_status);
      }

      if (filters.distance) {
        query = query.lte('distance', filters.distance);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data as unknown[]).map(provider => ({
        ...provider,
        name: provider.provider_name,
        locations: [{
          address: provider.location?.address || '',
          phone: provider.contact_info?.phone || ''
        }]
      })) as InsuranceProvider[];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Find a Provider")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t("Search by name or specialty")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select 
              value={filters.specialty} 
              onValueChange={(value) => setFilters(f => ({ ...f, specialty: value }))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("Specialty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("All Specialties")}</SelectItem>
                <SelectItem value="primary_care">{t("Primary Care")}</SelectItem>
                <SelectItem value="cardiology">{t("Cardiology")}</SelectItem>
                <SelectItem value="neurology">{t("Neurology")}</SelectItem>
                <SelectItem value="orthopedics">{t("Orthopedics")}</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.distance.toString()}
              onValueChange={(value) => setFilters(f => ({ ...f, distance: parseInt(value) }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("Distance")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t("Within 5 miles")}</SelectItem>
                <SelectItem value="10">{t("Within 10 miles")}</SelectItem>
                <SelectItem value="25">{t("Within 25 miles")}</SelectItem>
                <SelectItem value="50">{t("Within 50 miles")}</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.network_status}
              onValueChange={(value: 'in-network' | 'out-of-network') => 
                setFilters(f => ({ ...f, network_status: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("Network Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-network">{t("In-Network")}</SelectItem>
                <SelectItem value="out-of-network">{t("Out-of-Network")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : providers?.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">{t("No providers found matching your criteria")}</p>
              </div>
            ) : (
              providers?.map((provider) => (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{provider.provider_name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {provider.locations?.[0].address || t('Address not available')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            {provider.rating ? `${provider.rating} / 5` : t('No rating')}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={provider.network_status === 'in-network' ? 'default' : 'secondary'}>
                        {t(provider.network_status === 'in-network' ? 'In-Network' : 'Out-of-Network')}
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        {t("View Profile")}
                      </Button>
                      <Button size="sm">
                        {t("Schedule Visit")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
