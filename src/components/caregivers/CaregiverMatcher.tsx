import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaregiverCard } from "./CaregiverCard";
import { SpecializedCareFilters } from "../filters/SpecializedCareFilters";
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
import { Json } from "@/integrations/supabase/types";

interface LocationData {
  latitude: number;
  longitude: number;
}

interface Schedule {
  day: string;
  times: Array<{
    start: string;
    end: string;
  }>;
}

interface AvailabilityPreferences {
  virtual?: boolean;
  inPerson?: boolean;
  radius?: number;
}

interface Availability {
  location?: LocationData;
  schedule?: Schedule[];
  preferences?: AvailabilityPreferences;
}

interface SimplifiedCaregiverProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  skills: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  background_check_status: string | null;
  identity_verified: boolean | null;
  service_radius: number | null;
  user: {
    first_name: string;
    last_name: string;
  };
  certifications: Json[];
  availability: Availability | null;
  location: LocationData | null;
  age_groups_experience?: string[] | null;
  pet_types_experience?: string[] | null;
  special_needs_certifications?: Json[] | null;
}

interface CompanionMatch {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  skills: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  background_check_status: string | null;
  identity_verified: boolean | null;
  service_radius: number | null;
  user: {
    first_name: string;
    last_name: string;
  };
  certifications: Json[];
  availability: Availability | null;
  location: LocationData | null;
  age_groups_experience?: string[] | null;
  pet_types_experience?: string[] | null;
  special_needs_certifications?: Json[] | null;
  dementia_care_certified?: boolean;
  dementia_care_experience_years?: number;
  cognitive_support_specialties?: string[];
}

interface CompanionFilters {
  specialization: string;
  maxRate: number;
  experienceYears: number;
  verifiedOnly: boolean;
  dementiaOnly: boolean;
  mentalHealthOnly: boolean;
  emergencyResponse: boolean;
  maxDistance: number;
  careType: string;
  ageGroup: string;
  petType: string;
  specialNeeds: string;
}

interface CaregiverMatcherProps {}

export function CaregiverMatcher({}: CaregiverMatcherProps) {
  const [caregivers, setCaregivers] = useState<SimplifiedCaregiverProfile[]>([]);
  const [filters, setFilters] = useState({
    specialization: "",
    maxRate: 100,
    experienceYears: 0,
    verifiedOnly: false,
    dementiaOnly: false,
    mentalHealthOnly: false,
    emergencyResponse: false,
    maxDistance: 50,
    careType: "",
    ageGroup: "",
    petType: "",
    specialNeeds: ""
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

      // Apply care type specific filters
      if (filters.careType === 'children') {
        query = query.contains('age_groups_experience', [filters.ageGroup]);
      } else if (filters.careType === 'pets') {
        query = query.contains('pet_types_experience', [filters.petType]);
      } else if (filters.careType === 'special-needs') {
        query = query.contains('special_needs_certifications', [filters.specialNeeds]);
      }

      if (filters.specialization) {
        query = query.contains('specializations', [filters.specialization]);
      }

      if (filters.verifiedOnly) {
        query = query.eq('identity_verified', true);
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

      let filteredCaregivers = (data || []).map(caregiver => {
        const availabilityData = caregiver.availability as Availability | null;
        const locationData = availabilityData?.location || null;
        
        return {
          ...caregiver,
          certifications: Array.isArray(caregiver.certifications) ? caregiver.certifications : [],
          location: locationData,
          availability: availabilityData,
          special_needs_certifications: Array.isArray(caregiver.special_needs_certifications) 
            ? caregiver.special_needs_certifications 
            : []
        } as SimplifiedCaregiverProfile;
      });

      if (userLocation && filters.maxDistance > 0) {
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
              value={filters.careType}
              onValueChange={(value) => setFilters({ ...filters, careType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Care Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elderly">Senior Care</SelectItem>
                <SelectItem value="children">Child Care</SelectItem>
                <SelectItem value="special-needs">Special Needs Care</SelectItem>
                <SelectItem value="pets">Pet Care</SelectItem>
                <SelectItem value="family">Family Care</SelectItem>
              </SelectContent>
            </Select>

            {filters.careType === 'children' && (
              <Select
                value={filters.ageGroup}
                onValueChange={(value) => setFilters({ ...filters, ageGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infant">Infant (0-1)</SelectItem>
                  <SelectItem value="toddler">Toddler (1-3)</SelectItem>
                  <SelectItem value="preschool">Preschool (3-5)</SelectItem>
                  <SelectItem value="school-age">School Age (5-12)</SelectItem>
                  <SelectItem value="teenager">Teenager (13+)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {filters.careType === 'pets' && (
              <Select
                value={filters.petType}
                onValueChange={(value) => setFilters({ ...filters, petType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pet Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="bird">Birds</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                  <SelectItem value="small-animal">Small Animals</SelectItem>
                </SelectContent>
              </Select>
            )}

            {filters.careType === 'special-needs' && (
              <Select
                value={filters.specialNeeds}
                onValueChange={(value) => setFilters({ ...filters, specialNeeds: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="autism">Autism Support</SelectItem>
                  <SelectItem value="physical">Physical Disabilities</SelectItem>
                  <SelectItem value="developmental">Developmental Disabilities</SelectItem>
                  <SelectItem value="behavioral">Behavioral Support</SelectItem>
                  <SelectItem value="learning">Learning Disabilities</SelectItem>
                </SelectContent>
              </Select>
            )}

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

          <SpecializedCareFilters
            dementiaOnly={filters.dementiaOnly}
            mentalHealthOnly={filters.mentalHealthOnly}
            onDementiaChange={(value) => setFilters({ ...filters, dementiaOnly: value })}
            onMentalHealthChange={(value) => setFilters({ ...filters, mentalHealthOnly: value })}
          />

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
}

export { CaregiverMatcher };
