
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Brain, Search, MapPin, Phone, Mail, Building2, Heart, DollarSign, Star, CheckCircle, Award } from "lucide-react";
import { CareFacility } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FacilityReviews } from "./FacilityReviews";
import { FacilitySubscriptionPlans } from "./FacilitySubscriptionPlans";
import { mockTableQuery } from "@/utils/supabaseHelpers";

interface FacilitiesComparisonProps {
  facilities: CareFacility[];
  isAnalyzing: boolean;
  onCompare: (facilities: CareFacility[]) => void;
  onLocationChange: (country: string, state: string) => void;
}

interface FacilityLead {
  id: string;
  facility_id: string;
  contact_preference: 'email' | 'phone' | 'both';
  email: string;
  phone_number: string;
  notes: string;
  lead_status: string;
  created_at?: string;
}

export const FacilitiesComparison = ({
  facilities,
  isAnalyzing,
  onCompare,
  onLocationChange,
}: FacilitiesComparisonProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<CareFacility | null>(null);
  const [leadForm, setLeadForm] = useState({
    contact_preference: 'email' as 'email' | 'phone' | 'both',
    email: '',
    phone_number: '',
    notes: ''
  });
  const [showReviews, setShowReviews] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [selectedFacilityForReviews, setSelectedFacilityForReviews] = useState<CareFacility | null>(null);
  const { toast } = useToast();

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    onLocationChange(value, "all");
    setSelectedState("all");
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    onLocationChange(selectedCountry, value);
  };

  const handleLeadSubmit = async (facility: CareFacility) => {
    try {
      // Create mock facility lead since the table doesn't exist
      const mockLead: FacilityLead = {
        id: `mock-lead-${Date.now()}`,
        facility_id: facility.id,
        contact_preference: leadForm.contact_preference,
        email: leadForm.email,
        phone_number: leadForm.phone_number,
        notes: leadForm.notes,
        lead_status: 'new',
        created_at: new Date().toISOString()
      };

      await mockTableQuery<FacilityLead>([mockLead]);

      toast({
        title: "Success",
        description: "Thank you for your interest. A representative will contact you shortly.",
      });

      setSelectedFacility(null);
      setLeadForm({
        contact_preference: 'email',
        email: '',
        phone_number: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const searchNearbyFacilities = async () => {
    try {
      setIsSearching(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/functions/v1/search-care-facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          radius: 5000,
        }),
      });

      if (!response.ok) throw new Error('Failed to search for facilities');

      const { facilities: nearbyFacilities } = await response.json();
      onCompare(nearbyFacilities);
      
      toast({
        title: "Success",
        description: `Found ${nearbyFacilities.length} facilities near you`,
      });
    } catch (error) {
      console.error('Error searching facilities:', error);
      toast({
        title: "Error",
        description: "Failed to search for nearby facilities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[#F2FCE2] p-6 rounded-lg shadow-sm">
        <div>
          <Label className="text-[#1A1F2C] font-semibold">Country</Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="bg-white border-[#9b87f5] focus:ring-[#9b87f5]">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#1A1F2C] font-semibold">State/Province</Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger className="bg-white border-[#9b87f5] focus:ring-[#9b87f5]">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {selectedCountry === "USA" ? (
                <>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Ontario">Ontario</SelectItem>
                  <SelectItem value="Quebec">Quebec</SelectItem>
                  <SelectItem value="British Columbia">British Columbia</SelectItem>
                  <SelectItem value="Alberta">Alberta</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <Card key={facility.id} className="h-full group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  {facility.name}
                  {facility.verified && (
                    <Badge variant="secondary" className="ml-2 bg-white/20">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <Heart className="h-5 w-5 text-[#FFDEE2]" />
              </div>
              <CardDescription className="flex items-center text-white/90">
                <MapPin className="h-4 w-4 mr-1" />
                {facility.location.city}, {facility.location.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">{facility.description}</p>
              
              {facility.services && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#1A1F2C]">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {facility.services.map((service) => (
                      <Badge 
                        key={service} 
                        variant="secondary"
                        className="bg-[#F2FCE2] text-[#1A1F2C] hover:bg-[#9b87f5] hover:text-white transition-colors"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {facility.amenities && facility.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#1A1F2C]">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {facility.amenities.map((amenity) => (
                      <Badge 
                        key={amenity}
                        variant="outline"
                        className="text-[#1A1F2C]"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {facility.cost_range && (
                <div className="text-sm bg-[#0EA5E9]/10 p-3 rounded-md">
                  <span className="font-medium flex items-center gap-1 text-[#1A1F2C]">
                    <DollarSign className="h-4 w-4 text-[#F97316]" />
                    Cost Range: 
                  </span>
                  <span className="text-[#F97316] font-semibold">
                    ${facility.cost_range.min.toLocaleString()} - ${facility.cost_range.max.toLocaleString()}/month
                  </span>
                </div>
              )}

              {facility.awards && facility.awards.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-[#1A1F2C]">Awards & Recognition:</h4>
                  <div className="flex flex-wrap gap-2">
                    {facility.awards.map((award, index) => (
                      <Badge 
                        key={index}
                        className="bg-[#9b87f5] text-white"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {award.name} ({award.year})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2 mt-4">
                <Button 
                  variant="default"
                  className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white transition-colors"
                  onClick={() => {
                    setSelectedFacilityForReviews(facility);
                    setShowReviews(true);
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  View Reviews & Ratings
                </Button>
                
                {facility.subscription_tier === 'basic' && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSubscriptionPlans(true)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Upgrade Listing
                  </Button>
                )}

                <Button 
                  variant="default"
                  className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white"
                  onClick={() => setSelectedFacility(facility)}
                >
                  Get Information
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={showReviews} onOpenChange={setShowReviews}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reviews & Ratings for {selectedFacilityForReviews?.name}</DialogTitle>
          </DialogHeader>
          <FacilityReviews
            reviews={[]} // You'll need to fetch these from your backend
            onWriteReview={() => {
              setShowReviews(false);
              setSelectedFacility(selectedFacilityForReviews);
            }}
            isPremium={selectedFacilityForReviews?.subscription_tier === 'premium'}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showSubscriptionPlans} onOpenChange={setShowSubscriptionPlans}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Facility Listing</DialogTitle>
            <DialogDescription>
              Choose a plan to enhance your facility's visibility and features
            </DialogDescription>
          </DialogHeader>
          <FacilitySubscriptionPlans
            plans={[]} // You'll need to fetch these from your backend
            onSelectPlan={(plan) => {
              // Handle plan selection
              setShowSubscriptionPlans(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button 
          onClick={() => onCompare(facilities)}
          className="flex-1 bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          size="lg"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Brain className="mr-2 h-5 w-5 animate-pulse" />
              Analyzing Facilities...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-5 w-5" />
              Compare Facilities
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={searchNearbyFacilities}
          disabled={isSearching}
          className="flex-1 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
        >
          {isSearching ? (
            <>
              <Search className="mr-2 h-5 w-5 animate-pulse" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Find Nearby Facilities
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
