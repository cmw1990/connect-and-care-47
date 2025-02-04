import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaregiverCard } from "./CaregiverCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Search, MapPin, Clock, Shield, Star } from "lucide-react";
import { getCurrentLocation, calculateDistance } from "@/utils/locationUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type CaregiverProfile = Database['public']['Tables']['caregiver_profiles']['Row'] & {
  user: {
    first_name: string;
    last_name: string;
  };
};

type LocationData = {
  latitude: number;
  longitude: number;
};

interface CaregiverWithLocation extends Omit<CaregiverProfile, 'certifications' | 'availability'> {
  certifications: any[];
  availability: any;
  location?: LocationData;
}

export const CaregiverMatcher = () => {
  const [caregivers, setCaregivers] = useState<CaregiverWithLocation[]>([]);
  const [filters, setFilters] = useState({
    specialization: "",
    maxRate: 100,
    experienceYears: 0,
    verifiedOnly: false,
    dementiaOnly: false,
    mentalHealthOnly: false,
    emergencyResponse: false,
    maxDistance: 50
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    fetchCaregivers();
  }, [filters, userLocation]);

  const initializeLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Access Failed",
        description: "Unable to access your location. Distance-based search will be disabled.",
        variant: "destructive",
      });
    }
  };

  const fetchCaregivers = async () => {
    try {
      let query = supabase
        .from('caregiver_profiles')
        .select(`
          *,
          user:profiles(first_name, last_name)
        `);

      if (filters.specialization) {
        query = query.contains('specializations', [filters.specialization]);
      }

      if (filters.verifiedOnly) {
        query = query.eq('background_check_status', 'verified');
      }

      if (filters.dementiaOnly) {
        query = query.eq('dementia_care_certified', true);
      }

      if (filters.mentalHealthOnly) {
        query = query.eq('mental_health_certified', true);
      }

      if (filters.emergencyResponse) {
        query = query.eq('emergency_response', true);
      }

      if (filters.experienceYears > 0) {
        query = query.gte('experience_years', filters.experienceYears);
      }

      query = query.lte('hourly_rate', filters.maxRate);

      const { data, error } = await query;

      if (error) throw error;

      let filteredCaregivers = (data || []) as CaregiverWithLocation[];

      // Apply distance filter if user location is available
      if (userLocation) {
        filteredCaregivers = filteredCaregivers.filter(caregiver => {
          if (!caregiver.location?.latitude || !caregiver.location?.longitude) return false;
          
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            caregiver.location.latitude,
            caregiver.location.longitude
          );
          
          return distance <= filters.maxDistance;
        });
      }

      setCaregivers(filteredCaregivers);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
      toast({
        title: "Error",
        description: "Failed to load caregivers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-600" />
          Find Your Caregiver
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.specialization}
              onValueChange={(value) => setFilters({ ...filters, specialization: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mental_health">Mental Health Support</SelectItem>
                <SelectItem value="dementia_care">Dementia Care</SelectItem>
                <SelectItem value="elderly_care">Elderly Care</SelectItem>
                <SelectItem value="medication_management">Medication Management</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Max distance (miles)"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
              className="w-full"
            />

            <Input
              type="number"
              placeholder="Max hourly rate"
              value={filters.maxRate}
              onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) })}
              className="w-full"
            />

            <Select
              value={filters.experienceYears.toString()}
              onValueChange={(value) => setFilters({ ...filters, experienceYears: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Experience</SelectItem>
                <SelectItem value="1">1+ Years</SelectItem>
                <SelectItem value="3">3+ Years</SelectItem>
                <SelectItem value="5">5+ Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={filters.verifiedOnly ? "bg-primary-100" : ""}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verified Only
            </Button>

            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, dementiaOnly: !filters.dementiaOnly })}
              className={filters.dementiaOnly ? "bg-primary-100" : ""}
            >
              Dementia Certified
            </Button>

            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, mentalHealthOnly: !filters.mentalHealthOnly })}
              className={filters.mentalHealthOnly ? "bg-primary-100" : ""}
            >
              Mental Health Certified
            </Button>

            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, emergencyResponse: !filters.emergencyResponse })}
              className={filters.emergencyResponse ? "bg-primary-100" : ""}
            >
              Emergency Response
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {isLoading ? (
              <div className="col-span-2 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : caregivers.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No caregivers found matching your criteria</p>
              </div>
            ) : (
              caregivers.map((caregiver) => (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};