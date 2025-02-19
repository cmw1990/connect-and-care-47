import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Search, MapPin, Clock, Shield, Star, Filter, Calendar } from "lucide-react";
import { getCurrentLocation, calculateDistance } from "@/utils/locationUtils";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { AdvancedFiltersSheet } from "./components/AdvancedFiltersSheet";
import { BookingDialog } from "./components/BookingDialog";
import type { CaregiverProfile, CareReview, Availability } from "@/types/caregiver";

interface CaregiverFilters {
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

interface AdvancedFilters {
  availability: string[];
  languages: string[];
  specialNeeds: string[];
  transportationProvided: boolean;
  backgroundChecked: boolean;
  yearsOfExperience: number;
  maxHourlyRate: number;
  ratings: number;
}

interface BookingFormData {
  start_time: string;
  end_time: string;
  notes: string;
}

export function CaregiverMatcher() {
  const [filters, setFilters] = useState<CaregiverFilters>({
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

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    availability: [],
    languages: [],
    specialNeeds: [],
    transportationProvided: false,
    backgroundChecked: false,
    yearsOfExperience: 0,
    maxHourlyRate: 50,
    ratings: 4
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    start_time: "",
    end_time: "",
    notes: ""
  });
  
  const { toast } = useToast();

  const { data: caregivers, isLoading } = useQuery({
    queryKey: ['caregivers', filters, advancedFilters],
    queryFn: async () => {
      let query = supabase
        .from('caregiver_profiles')
        .select(`
          *,
          user:profiles(first_name, last_name)
        `);

      // Apply filters
      if (filters.verifiedOnly) {
        query = query.eq('identity_verified', true);
      }
      if (filters.dementiaOnly) {
        query = query.eq('dementia_care_certified', true);
      }
      if (advancedFilters.backgroundChecked) {
        query = query.eq('background_check_status', 'verified');
      }
      if (filters.experienceYears > 0) {
        query = query.gte('experience_years', filters.experienceYears);
      }
      if (advancedFilters.maxHourlyRate > 0) {
        query = query.lte('hourly_rate', advancedFilters.maxHourlyRate);
      }

      const { data: caregiverData, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Get all care reviews in a separate query
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('care_reviews')
        .select('*');

      if (reviewsError) {
        console.error('Reviews query error:', reviewsError);
        throw reviewsError;
      }

      const caregivers = caregiverData as unknown as CaregiverProfile[];
      const reviews = reviewsData as CareReview[];

      // Add ratings data to caregivers
      const enrichedCaregivers = caregivers.map(caregiver => {
        const caregiverReviews = reviews.filter(r => r.reviewee_id === caregiver.id);
        const avgRating = caregiverReviews.length > 0
          ? caregiverReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / caregiverReviews.length
          : 0;
        
        return {
          ...caregiver,
          ratings_aggregate: {
            avg_rating: avgRating,
            count: caregiverReviews.length
          }
        };
      });

      let filteredData = enrichedCaregivers;

      // Apply location filtering
      if (userLocation) {
        filteredData = filteredData.filter(caregiver => {
          if (!caregiver.latitude || !caregiver.longitude) return false;
          
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            caregiver.latitude,
            caregiver.longitude
          );
          
          return distance <= filters.maxDistance;
        });
      }

      // Apply rating filtering
      if (advancedFilters.ratings > 0) {
        filteredData = filteredData.filter(caregiver => {
          return (caregiver.ratings_aggregate?.avg_rating || 0) >= advancedFilters.ratings;
        });
      }

      // Sort by rating
      return filteredData.sort((a, b) => {
        const aRating = a.ratings_aggregate?.avg_rating || 0;
        const bRating = b.ratings_aggregate?.avg_rating || 0;
        return bRating - aRating;
      });
    }
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', selectedCaregiver],
    enabled: !!selectedCaregiver,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('caregiver_availability')
        .select('*')
        .eq('caregiver_id', selectedCaregiver);

      if (error) {
        throw error;
      }

      return data as Availability[];
    }
  });

  useEffect(() => {
    initializeLocation();
  }, []);

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

  const handleBookingSubmit = async () => {
    if (!selectedCaregiver) return;

    try {
      const { error } = await supabase
        .from('caregiver_bookings')
        .insert({
          caregiver_id: selectedCaregiver,
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          notes: bookingData.notes,
          rate: caregivers?.find(c => c.id === selectedCaregiver)?.hourly_rate || 0
        });

      if (error) throw error;

      toast({
        title: "Booking Requested",
        description: "Your booking request has been sent to the caregiver.",
      });

      setSelectedCaregiver(null);
      setBookingData({
        start_time: "",
        end_time: "",
        notes: ""
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdvancedFilterChange = (key: string, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBookingDataChange = (data: Partial<BookingFormData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
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
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Search caregivers..."
                className="w-full"
                onChange={(e) => {
                  // Implement search functionality
                }}
              />
            </div>
            
            <AdvancedFiltersSheet
              filters={filters}
              advancedFilters={advancedFilters}
              onFiltersChange={handleFilterChange}
              onAdvancedFiltersChange={handleAdvancedFilterChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <AnimatePresence>
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : caregivers?.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No caregivers found matching your criteria</p>
                </div>
              ) : (
                caregivers?.map((caregiver) => (
                  <motion.div
                    key={caregiver.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookingDialog
                      caregiver={caregiver}
                      availability={availability}
                      bookingData={bookingData}
                      onBookingSubmit={handleBookingSubmit}
                      onBookingDataChange={handleBookingDataChange}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
