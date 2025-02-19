
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

interface CaregiverProfile {
  id: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hourly_rate: number;
  experience_years: number;
  background_check_verified: boolean;
  specializations: string[];
  bio: string;
  avatar_url?: string;
  ratings?: Array<{
    rating: number;
    review: string;
  }>;
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
      let { data: caregiverData, error } = await supabase
        .from('caregiver_profiles')
        .select(`
          *,
          user:profiles(first_name, last_name),
          ratings:caregiver_ratings(rating, review)
        `)
        .eq(filters.verifiedOnly ? 'identity_verified' : 'id', filters.verifiedOnly ? true : 'id')
        .eq(filters.dementiaOnly ? 'dementia_care_certified' : 'id', filters.dementiaOnly ? true : 'id')
        .eq(advancedFilters.backgroundChecked ? 'background_check_verified' : 'id', advancedFilters.backgroundChecked ? true : 'id')
        .gte(filters.experienceYears > 0 ? 'experience_years' : 'id', filters.experienceYears > 0 ? filters.experienceYears : 'id');

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      let filteredData = (caregiverData || []) as unknown as CaregiverProfile[];

      if (userLocation) {
        filteredData = filteredData.filter(caregiver => {
          const coordinates = caregiver as any;
          if (!coordinates?.latitude || !coordinates?.longitude) return false;
          
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coordinates.latitude,
            coordinates.longitude
          );
          
          return distance <= filters.maxDistance;
        });
      }

      // Sort by rating
      filteredData.sort((a, b) => {
        const aRatings = Array.isArray(a.ratings) ? a.ratings : [];
        const bRatings = Array.isArray(b.ratings) ? b.ratings : [];
        
        const aRating = aRatings.reduce((acc, curr) => acc + curr.rating, 0) / (aRatings.length || 1);
        const bRating = bRatings.reduce((acc, curr) => acc + curr.rating, 0) / (bRatings.length || 1);
        return bRating - aRating;
      });

      return filteredData;
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
