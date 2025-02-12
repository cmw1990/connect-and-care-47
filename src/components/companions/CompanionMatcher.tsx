import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanionCard } from "./CompanionCard";
import type { Json } from "@/integrations/supabase/types";

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
      <div className="flex items-center mb-4">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search companions..."
          className="ml-2"
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="flex justify-center">Loading...</div>
        ) : (
          matches.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onConnect={handleConnect}
            />
          ))
        )}
      </div>
    </Card>
  );
};
