
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaregiverCard } from "./CaregiverCard";
import { SpecializedCareFilters } from "../filters/SpecializedCareFilters";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

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

interface CareReview {
  id: string;
  reviewee_id: string;
  reviewee_type: string;
  rating: number;
  review: string;
}

interface CaregiverProfile {
  id: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  hourly_rate: number;
  experience_years: number;
  background_check_verified: boolean;
  specializations: string[];
  bio: string;
  avatar_url?: string;
  identity_verified: boolean;
  dementia_care_certified: boolean;
  latitude?: number;
  longitude?: number;
  ratings_aggregate?: {
    avg_rating: number;
    count: number;
  };
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
        query = query.eq('background_check_verified', true);
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
        .select('*')
        .eq('reviewee_type', 'caregiver');

      if (reviewsError) {
        console.error('Reviews query error:', reviewsError);
        throw reviewsError;
      }

      const caregivers = caregiverData as CaregiverProfile[];
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
          {/* Search and Quick Filters */}
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
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Maximum Hourly Rate</Label>
                    <Slider
                      value={[advancedFilters.maxHourlyRate]}
                      onValueChange={([value]) => 
                        setAdvancedFilters(prev => ({ ...prev, maxHourlyRate: value }))
                      }
                      max={100}
                      step={5}
                    />
                    <span className="text-sm text-muted-foreground">
                      Up to ${advancedFilters.maxHourlyRate}/hour
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-5 w-5 cursor-pointer ${
                            rating <= advancedFilters.ratings
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => 
                            setAdvancedFilters(prev => ({ ...prev, ratings: rating }))
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="background-check"
                      checked={advancedFilters.backgroundChecked}
                      onCheckedChange={(checked) =>
                        setAdvancedFilters(prev => ({ ...prev, backgroundChecked: checked }))
                      }
                    />
                    <Label htmlFor="background-check">Background Checked Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transportation"
                      checked={advancedFilters.transportationProvided}
                      onCheckedChange={(checked) =>
                        setAdvancedFilters(prev => ({ ...prev, transportationProvided: checked }))
                      }
                    />
                    <Label htmlFor="transportation">Provides Transportation</Label>
                  </div>

                  <Select
                    value={filters.specialization}
                    onValueChange={(value) => setFilters({ ...filters, specialization: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dementia">Dementia Care</SelectItem>
                      <SelectItem value="elderly">Elderly Care</SelectItem>
                      <SelectItem value="disability">Disability Support</SelectItem>
                      <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                      <SelectItem value="palliative">Palliative Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results */}
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
                    <CaregiverCard
                      caregiver={caregiver}
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
