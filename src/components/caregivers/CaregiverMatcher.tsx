import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CaregiverCard } from "./CaregiverCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Search, MapPin, Clock, Shield, Star } from "lucide-react";

interface Caregiver {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  skills: string[];
  certifications: any[];
  background_check_status: string;
  rating: number;
  identity_verified: boolean;
  user: {
    first_name: string;
    last_name: string;
  };
}

export const CaregiverMatcher = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [filters, setFilters] = useState({
    specialization: "",
    maxRate: 100,
    experienceYears: 0,
    verifiedOnly: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCaregivers();
  }, [filters]);

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

      if (filters.experienceYears > 0) {
        query = query.gte('experience_years', filters.experienceYears);
      }

      query = query.lte('hourly_rate', filters.maxRate);

      const { data, error } = await query;

      if (error) throw error;
      setCaregivers(data || []);
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

  const handleConnect = async (caregiverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to connect with caregivers",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('care_connections')
        .insert({
          requester_id: user.id,
          recipient_id: caregiverId,
          connection_type: 'carer',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
    } catch (error) {
      console.error('Error connecting with caregiver:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
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

            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Max hourly rate"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

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

            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={filters.verifiedOnly ? "bg-primary-100" : ""}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verified Only
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
                  onBook={() => handleConnect(caregiver.id)}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};