
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Video, Phone, MapPin, Clock, Shield, Star, Brain, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecializedCareFilters } from "@/components/filters/SpecializedCareFilters";
import { Json } from "@/integrations/supabase/types";

interface CompanionMatch {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  expertise_areas: string[];
  dementia_experience: boolean;
  communication_preferences: string[];
  languages: string[];
  virtual_meeting_preference: boolean;
  in_person_meeting_preference: boolean;
  rating: number;
  hourly_rate: number;
  identity_verified: boolean;
  mental_health_specialties: string[];
  support_tools_proficiency: Json;
  virtual_meeting_tools: string[];
  cognitive_engagement_activities?: {
    memory_games?: string[];
    brain_teasers?: string[];
    social_activities?: string[];
    creative_exercises?: string[];
  };
  cultural_competencies?: string[];
  music_therapy_certified?: boolean;
  art_therapy_certified?: boolean;
}

export const CompanionMatcher = () => {
  const [matches, setMatches] = useState<CompanionMatch[]>([]);
  const [filters, setFilters] = useState({
    expertiseArea: "",
    communicationType: "",
    dementiaExperience: false,
    mentalHealthSupport: false,
    maxRate: 100,
    supportTools: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanions();
  }, [filters]);

  const fetchCompanions = async () => {
    try {
      let query = supabase
        .from('companion_profiles')
        .select(`
          *,
          user:profiles(first_name, last_name)
        `);

      if (filters.expertiseArea) {
        query = query.contains('expertise_areas', [filters.expertiseArea]);
      }

      if (filters.dementiaExperience) {
        query = query.eq('dementia_experience', true);
      }

      if (filters.mentalHealthSupport) {
        query = query.eq('mental_health_support', true);
      }

      if (filters.communicationType === 'virtual') {
        query = query.eq('virtual_meeting_preference', true);
      } else if (filters.communicationType === 'in-person') {
        query = query.eq('in_person_meeting_preference', true);
      }

      if (filters.supportTools.length > 0) {
        query = query.contains('support_tools_proficiency', filters.supportTools);
      }

      query = query.lte('hourly_rate', filters.maxRate);

      const { data, error } = await query;

      if (error) throw error;

      // Parse the JSON fields before setting state
      const parsedData = (data || []).map(companion => ({
        ...companion,
        cognitive_engagement_activities: typeof companion.cognitive_engagement_activities === 'string' 
          ? JSON.parse(companion.cognitive_engagement_activities)
          : companion.cognitive_engagement_activities || {
              memory_games: [],
              brain_teasers: [],
              social_activities: [],
              creative_exercises: []
            }
      })) as CompanionMatch[];

      setMatches(parsedData);
    } catch (error) {
      console.error('Error fetching companions:', error);
      toast({
        title: "Error",
        description: "Failed to load companion matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (companionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to connect with companions",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('care_connections')
        .insert({
          requester_id: user.id,
          recipient_id: companionId,
          connection_type: 'pal',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
    } catch (error) {
      console.error('Error connecting with companion:', error);
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
          Find Your Companion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.expertiseArea}
              onValueChange={(value) => setFilters({ ...filters, expertiseArea: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Expertise Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mental_health">Mental Health Support</SelectItem>
                <SelectItem value="dementia_care">Dementia Care</SelectItem>
                <SelectItem value="anxiety_support">Anxiety Support</SelectItem>
                <SelectItem value="depression_support">Depression Support</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.communicationType}
              onValueChange={(value) => setFilters({ ...filters, communicationType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Communication Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual Only</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="both">Both</SelectItem>
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

            <SpecializedCareFilters
              dementiaOnly={filters.dementiaExperience}
              mentalHealthOnly={filters.mentalHealthSupport}
              onDementiaChange={(value) => setFilters({ ...filters, dementiaExperience: value })}
              onMentalHealthChange={(value) => setFilters({ ...filters, mentalHealthSupport: value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {isLoading ? (
              <div className="col-span-2 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No companions found matching your criteria</p>
              </div>
            ) : (
              matches.map((companion) => (
                <Card key={companion.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {companion.user.first_name} {companion.user.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{companion.rating}/5</span>
                        </div>
                      </div>
                      {companion.identity_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shield className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {companion.expertise_areas?.map((area) => (
                          <Badge key={area} variant="outline">
                            {area.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      {companion.mental_health_specialties?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span>Mental Health Specialist</span>
                        </div>
                      )}

                      {companion.support_tools_proficiency && Object.keys(companion.support_tools_proficiency).length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          <span>Support Tools Expert</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {companion.virtual_meeting_preference && (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            <span>Virtual</span>
                          </div>
                        )}
                        {companion.in_person_meeting_preference && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>In-Person</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-lg font-semibold">
                          ${companion.hourly_rate}/hr
                        </span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button onClick={() => handleConnect(companion.id)}>
                            Connect
                          </Button>
                        </div>
                      </div>
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
