
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, Search, MapPin, Clock, Shield, Star, Filter } from "lucide-react";
import { getCurrentLocation, calculateDistance } from "@/utils/locationUtils";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { castQueryResult, createMockProfile } from '@/utils/supabaseHelpers';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Availability, CaregiverProfile, CareReview } from "@/types/caregiver";

// Mock data for caregivers
const mockCaregivers: CaregiverProfile[] = [
  {
    id: "1",
    first_name: "Sarah",
    last_name: "Johnson",
    bio: "Experienced caregiver with 10+ years of experience with elderly care.",
    specialties: ["Dementia", "Mobility Assistance", "Medication Management"],
    certifications: ["CNA", "First Aid", "CPR"],
    experience_years: 10,
    hourly_rate: 25,
    availability: ["Weekdays", "Weekends"],
    location: "Downtown, Boston",
    latitude: 42.3601,
    longitude: -71.0589,
    verified: true,
    rating: 4.9,
    reviews_count: 28,
    ratings_aggregate: {
      avg_rating: 4.9,
      count: 28
    }
  },
  {
    id: "2",
    first_name: "Michael",
    last_name: "Smith",
    bio: "Compassionate caregiver specializing in Alzheimer's and dementia care.",
    specialties: ["Alzheimer's", "Dementia", "Companionship"],
    certifications: ["Home Health Aide", "Dementia Care Specialist"],
    experience_years: 7,
    hourly_rate: 22,
    availability: ["Weekdays"],
    location: "Cambridge, MA",
    latitude: 42.3736,
    longitude: -71.1097,
    verified: true,
    rating: 4.7,
    reviews_count: 15,
    ratings_aggregate: {
      avg_rating: 4.7,
      count: 15
    }
  }
];

// Mock data for reviews
const mockReviews: CareReview[] = [
  {
    id: "1",
    reviewer_id: "user-1",
    caregiver_id: "1",
    rating: 5,
    comment: "Sarah is amazing! She took excellent care of my father.",
    created_at: "2023-03-15T14:30:00Z"
  },
  {
    id: "2",
    reviewer_id: "user-2",
    caregiver_id: "1",
    rating: 5,
    comment: "Very professional and compassionate. Highly recommended.",
    created_at: "2023-04-02T10:15:00Z"
  },
  {
    id: "3",
    reviewer_id: "user-3",
    caregiver_id: "2",
    rating: 4,
    comment: "Michael is very patient and knowledgeable. Great with my mom who has dementia.",
    created_at: "2023-02-28T16:45:00Z"
  }
];

// Mock data for availability
const mockAvailability: Availability[] = [
  {
    id: "1",
    caregiver_id: "1",
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "17:00"
  },
  {
    id: "2",
    caregiver_id: "1",
    day_of_week: "Wednesday",
    start_time: "09:00",
    end_time: "17:00"
  },
  {
    id: "3",
    caregiver_id: "1",
    day_of_week: "Friday",
    start_time: "09:00",
    end_time: "17:00"
  },
  {
    id: "4",
    caregiver_id: "2",
    day_of_week: "Tuesday",
    start_time: "08:00",
    end_time: "16:00"
  },
  {
    id: "5",
    caregiver_id: "2",
    day_of_week: "Thursday",
    start_time: "08:00",
    end_time: "16:00"
  }
];

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
  const currentUserId = "user-123"; // Mock user ID

  // Use the mock data directly
  const { data: caregivers = mockCaregivers, isLoading: caregiversLoading } = useQuery({
    queryKey: ['caregivers'],
    queryFn: async () => {
      return mockCaregivers;
    }
  });

  const { data: reviews = mockReviews } = useQuery({
    queryKey: ['caregiver-reviews'],
    queryFn: async () => {
      return mockReviews;
    }
  });

  const { data: availability = mockAvailability } = useQuery({
    queryKey: ['caregiver-availability', selectedCaregiver],
    queryFn: async () => {
      return mockAvailability.filter(a => a.caregiver_id === selectedCaregiver);
    },
    enabled: !!selectedCaregiver
  });

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      // In a real app, this would get the user's location
      // For now, use a mock location (Boston)
      setUserLocation({
        lat: 42.3601,
        lng: -71.0589
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
      const bookingDetails = {
        caregiver_id: selectedCaregiver,
        user_id: currentUserId,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        notes: bookingData.notes,
        rate: caregivers?.find(c => c.id === selectedCaregiver)?.hourly_rate || 0
      };
      
      console.log("Booking submitted:", bookingDetails);
      
      // In a real app, this would make a database call
      
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

  const filteredCaregivers = caregivers?.filter(caregiver => {
    // Apply specializations filter
    if (filters.specialization && !caregiver.specialties?.includes(filters.specialization)) {
      return false;
    }
    
    // Apply hourly rate filter
    if (caregiver.hourly_rate > filters.maxRate) {
      return false;
    }
    
    // Apply experience years filter
    if (filters.experienceYears > 0 && (caregiver.experience_years || 0) < filters.experienceYears) {
      return false;
    }
    
    // Apply verified filter
    if (filters.verifiedOnly && !caregiver.verified) {
      return false;
    }
    
    // Apply dementia filter
    if (filters.dementiaOnly && !caregiver.specialties?.includes('Dementia')) {
      return false;
    }
    
    // Apply rating filter
    if ((caregiver.ratings_aggregate?.avg_rating || 0) < advancedFilters.ratings) {
      return false;
    }
    
    // If we have user's location and caregiver's location, filter by distance
    if (userLocation && caregiver.latitude && caregiver.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        caregiver.latitude,
        caregiver.longitude
      );
      
      if (distance > filters.maxDistance) {
        return false;
      }
    }
    
    return true;
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdvancedFilterChange = (key: string, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBookingDataChange = (data: Partial<BookingFormData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const AdvancedFiltersSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="max-rate">Maximum Hourly Rate: ${filters.maxRate}</Label>
            <Slider
              id="max-rate"
              min={10}
              max={100}
              step={5}
              value={[filters.maxRate]}
              onValueChange={(value) => handleFilterChange('maxRate', value[0])}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="experience">Minimum Years of Experience: {filters.experienceYears}</Label>
            <Slider
              id="experience"
              min={0}
              max={20}
              step={1}
              value={[filters.experienceYears]}
              onValueChange={(value) => handleFilterChange('experienceYears', value[0])}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="distance">Maximum Distance: {filters.maxDistance} miles</Label>
            <Slider
              id="distance"
              min={5}
              max={100}
              step={5}
              value={[filters.maxDistance]}
              onValueChange={(value) => handleFilterChange('maxDistance', value[0])}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="rating">Minimum Rating: {advancedFilters.ratings}/5</Label>
            <Slider
              id="rating"
              min={1}
              max={5}
              step={0.5}
              value={[advancedFilters.ratings]}
              onValueChange={(value) => handleAdvancedFilterChange('ratings', value[0])}
              className="mt-2"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only">Verified Providers Only</Label>
            <Switch
              id="verified-only"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dementia-only">Dementia Care Specialists</Label>
            <Switch
              id="dementia-only"
              checked={filters.dementiaOnly}
              onCheckedChange={(checked) => handleFilterChange('dementiaOnly', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="background-checked">Background Checked</Label>
            <Switch
              id="background-checked"
              checked={advancedFilters.backgroundChecked}
              onCheckedChange={(checked) => handleAdvancedFilterChange('backgroundChecked', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Select
              value={filters.specialization}
              onValueChange={(value) => handleFilterChange('specialization', value)}
            >
              <SelectTrigger id="specialization" className="mt-2">
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Specialization</SelectItem>
                <SelectItem value="Dementia">Dementia Care</SelectItem>
                <SelectItem value="Alzheimer's">Alzheimer's Care</SelectItem>
                <SelectItem value="Parkinson's">Parkinson's Care</SelectItem>
                <SelectItem value="Mobility Assistance">Mobility Assistance</SelectItem>
                <SelectItem value="Medication Management">Medication Management</SelectItem>
                <SelectItem value="Companionship">Companionship</SelectItem>
                <SelectItem value="Meal Preparation">Meal Preparation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const BookingDialog = ({ caregiver }: { caregiver: CaregiverProfile }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setSelectedCaregiver(caregiver.id)}
          className="w-full bg-primary"
        >
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {caregiver.first_name} {caregiver.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={bookingData.start_time}
              onChange={(e) => handleBookingDataChange({ start_time: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end-time">End Time</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={bookingData.end_time}
              onChange={(e) => handleBookingDataChange({ end_time: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any special instructions..."
              value={bookingData.notes}
              onChange={(e) => handleBookingDataChange({ notes: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              Estimated cost: ${caregiver.hourly_rate}/hour
            </p>
            <Button 
              onClick={handleBookingSubmit}
              className="w-full"
              disabled={!bookingData.start_time || !bookingData.end_time}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const sortedCaregivers = [...(filteredCaregivers || [])].sort((a, b) => {
    // Sort by rating (highest first)
    return (b.ratings_aggregate?.avg_rating || 0) - (a.ratings_aggregate?.avg_rating || 0);
  });

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
                  // This would filter by name or bio
                }}
              />
            </div>
            
            <AdvancedFiltersSheet />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {caregiversLoading ? (
              <div className="col-span-2 flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : sortedCaregivers.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No caregivers found matching your criteria</p>
              </div>
            ) : (
              sortedCaregivers.map((caregiver) => (
                <motion.div
                  key={caregiver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">
                            {caregiver.first_name} {caregiver.last_name}
                          </h3>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{caregiver.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{caregiver.ratings_aggregate?.avg_rating || 0}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({caregiver.ratings_aggregate?.count || 0})
                          </span>
                        </div>
                      </div>
                      
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{caregiver.bio}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {caregiver.specialties?.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {specialty}
                          </span>
                        ))}
                        {(caregiver.specialties?.length || 0) > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                            +{(caregiver.specialties?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Certifications
                        </div>
                        <div className="mt-1 text-sm">
                          {caregiver.certifications?.join(', ') || 'None listed'}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Experience
                        </div>
                        <div className="mt-1 text-sm">
                          {caregiver.experience_years} years
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Hourly Rate
                        </div>
                        <div className="mt-1 text-lg font-semibold">${caregiver.hourly_rate}/hr</div>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        {caregiver.verified && (
                          <div className="flex items-center text-green-600 text-sm">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Verified</span>
                          </div>
                        )}
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {caregiver.availability?.join(', ') || 'Flexible hours'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <BookingDialog caregiver={caregiver} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
