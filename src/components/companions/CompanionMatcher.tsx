
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanionCard } from "./CompanionCard";
import type { Json } from "@/integrations/supabase/types";
import { CompanionMatch } from "@/types/supabase";
import { InsuranceClaimProcessor } from "@/components/insurance/InsuranceClaimProcessor";
import { DementiaSupport } from "@/components/caregivers/DementiaSupport";
import { safeSupabaseCast, safeSupabaseQuery } from "@/utils/supabaseHelpers";

interface CompanionFilters {
  expertiseArea: string;
  communicationType: string;
  dementiaExperience: boolean;
  mentalHealthSupport: boolean;
  maxRate: number;
  supportTools: string[];
  dementiaOnly: boolean;
}

const CompanionMatcher = () => {
  const [matches, setMatches] = useState<CompanionMatch[]>([]);
  const [filters, setFilters] = useState<CompanionFilters>({
    expertiseArea: "",
    communicationType: "",
    dementiaExperience: false,
    mentalHealthSupport: false,
    maxRate: 100,
    supportTools: [],
    dementiaOnly: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanions();
  }, [filters]);

  const fetchCompanions = async () => {
    try {
      setIsLoading(true);
      
      const fetchData = async () => {
        let query = supabase
          .from('companion_profiles')
          .select(`
            *,
            user:profiles(first_name, last_name)
          `);

        // Add dementia-specific filtering
        if (filters.dementiaOnly) {
          query = query
            .eq('dementia_care_certified', true)
            .order('dementia_experience_years', { ascending: false });
        }

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

        return query;
      };

      const data = await safeSupabaseQuery(
        async () => await fetchData().then(q => q.get()),
        []
      );

      // Process and map the data to ensure it matches the CompanionMatch interface
      const companions: CompanionMatch[] = safeSupabaseCast<CompanionMatch>(data, (companion) => ({
        id: companion.id || '',
        user: {
          first_name: companion.user?.first_name || 'Unknown',
          last_name: companion.user?.last_name || 'User'
        },
        expertise_areas: companion.expertise_areas || [],
        dementia_experience: !!companion.dementia_experience,
        communication_preferences: companion.communication_preferences || [],
        languages: companion.languages || [],
        virtual_meeting_preference: !!companion.virtual_meeting_preference,
        in_person_meeting_preference: !!companion.in_person_meeting_preference,
        rating: companion.rating || 0,
        hourly_rate: companion.hourly_rate || 0,
        identity_verified: !!companion.identity_verified,
        mental_health_specialties: companion.mental_health_specialties || [],
        support_tools_proficiency: companion.support_tools_proficiency || {},
        virtual_meeting_tools: companion.virtual_meeting_tools || [],
        interests: companion.interests || [],
        cognitive_engagement_activities: companion.cognitive_engagement_activities || {
          memory_games: [],
          brain_teasers: [],
          social_activities: [],
          creative_exercises: []
        },
        cultural_competencies: companion.cultural_competencies || [],
        music_therapy_certified: !!companion.music_therapy_certified,
        art_therapy_certified: !!companion.art_therapy_certified,
        availability: companion.availability,
        background_check_date: companion.background_check_date,
        bio: companion.bio,
        child_engagement_activities: companion.child_engagement_activities
      }));

      setMatches(companions);
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
          <Heart className="h-5 w-5" />
          Find Your Companion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filters.dementiaOnly && (
            <DementiaSupport
              onProfileUpdate={(profile) => {
                console.log("Updating dementia profile:", profile);
                // Handle profile update
              }}
            />
          )}
          
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search companions..."
              className="ml-2"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                // Filter companions based on the search input
                fetchCompanions().then(() => {
                  const filteredCompanions = matches.filter(companion => 
                    companion.bio?.toLowerCase().includes(value) ||
                    companion.user.first_name.toLowerCase().includes(value) ||
                    companion.user.last_name.toLowerCase().includes(value)
                  );
                  setMatches(filteredCompanions);
                });
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="flex justify-center">Loading...</div>
            ) : (
              matches.map((companion) => (
                <InsuranceClaimProcessor
                  key={companion.id}
                  serviceType="companion_care"
                  amount={companion.hourly_rate}
                  providerId={companion.id}
                  onSuccess={() => {
                    toast({
                      title: "Connection request sent",
                      description: "The companion will be notified of your request.",
                    });
                  }}
                >
                  <CompanionCard
                    companion={companion}
                    onConnect={handleConnect}
                  />
                </InsuranceClaimProcessor>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { CompanionMatcher };
