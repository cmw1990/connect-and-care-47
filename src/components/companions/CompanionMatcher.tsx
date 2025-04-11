
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeSupabaseQuery, mockSupabaseQuery } from "@/utils/supabaseHelpers";
import type { Json } from "@/integrations/supabase/types";
import { CompanionMatch } from "@/types/supabase";
import { InsuranceClaimProcessor } from "@/components/insurance/InsuranceClaimProcessor";
import { DementiaSupport } from "@/components/caregivers/DementiaSupport";

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
      
      // Create mock data for development purposes
      const mockCompanions: CompanionMatch[] = [
        {
          id: "1",
          user: { first_name: "John", last_name: "Smith" },
          expertise_areas: ["Memory Care", "Geriatric Support"],
          dementia_experience: true,
          communication_preferences: ["Email", "Phone"],
          languages: ["English", "Spanish"],
          virtual_meeting_preference: true,
          in_person_meeting_preference: true,
          rating: 4.8,
          hourly_rate: 35,
          identity_verified: true,
          mental_health_specialties: ["Anxiety", "Depression"],
          support_tools_proficiency: {} as Json,
          virtual_meeting_tools: ["Zoom", "Teams"],
          interests: ["Music", "Art"],
          cognitive_engagement_activities: {
            memory_games: ["Card Matching", "Picture Recognition"],
            brain_teasers: ["Puzzles", "Word Games"],
            social_activities: ["Group Discussions", "Storytelling"],
            creative_exercises: ["Drawing", "Music Appreciation"]
          }
        },
        {
          id: "2",
          user: { first_name: "Lisa", last_name: "Johnson" },
          expertise_areas: ["Music Therapy", "Companion Care"],
          dementia_experience: true,
          communication_preferences: ["Text", "Video Call"],
          languages: ["English", "French"],
          virtual_meeting_preference: true,
          in_person_meeting_preference: false,
          rating: 4.5,
          hourly_rate: 28,
          identity_verified: true,
          mental_health_specialties: ["Stress Management", "Mood Disorders"],
          support_tools_proficiency: {} as Json,
          virtual_meeting_tools: ["FaceTime", "Zoom"],
          interests: ["Reading", "Travel"],
          cognitive_engagement_activities: {
            memory_games: ["Association Games", "Memory Bingo"],
            brain_teasers: ["Trivia", "Logic Puzzles"],
            social_activities: ["Virtual Coffee Groups", "Book Club"],
            creative_exercises: ["Gentle Movement", "Guided Relaxation"]
          }
        }
      ];

      // Filter the mock data based on the user's filters
      let filteredCompanions = [...mockCompanions];
      
      if (filters.expertiseArea) {
        filteredCompanions = filteredCompanions.filter(companion => 
          companion.expertise_areas.some(area => 
            area.toLowerCase().includes(filters.expertiseArea.toLowerCase())
          )
        );
      }
      
      if (filters.dementiaExperience) {
        filteredCompanions = filteredCompanions.filter(companion => 
          companion.dementia_experience
        );
      }
      
      if (filters.communicationType === 'virtual') {
        filteredCompanions = filteredCompanions.filter(companion => 
          companion.virtual_meeting_preference
        );
      } else if (filters.communicationType === 'in-person') {
        filteredCompanions = filteredCompanions.filter(companion => 
          companion.in_person_meeting_preference
        );
      }
      
      // Apply hourly rate filter
      filteredCompanions = filteredCompanions.filter(companion => 
        companion.hourly_rate <= filters.maxRate
      );
      
      setMatches(filteredCompanions);
      
    } catch (error) {
      console.error('Error fetching companions:', error);
      toast({
        title: "Error",
        description: "Failed to load companions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CompanionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFavorite = async (companionId: string) => {
    toast({
      title: "Added to Favorites",
      description: "This companion has been added to your favorites.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find a Companion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Input
                placeholder="Search by expertise..."
                value={filters.expertiseArea}
                onChange={e => handleFilterChange('expertiseArea', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filters.communicationType === 'virtual' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('communicationType', 
                  filters.communicationType === 'virtual' ? '' : 'virtual')}
                className="flex-1"
              >
                Virtual
              </Button>
              <Button
                variant={filters.communicationType === 'in-person' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('communicationType', 
                  filters.communicationType === 'in-person' ? '' : 'in-person')}
                className="flex-1"
              >
                In Person
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Max Rate: ${filters.maxRate}/hr</span>
              <input
                type="range"
                min="10"
                max="200"
                value={filters.maxRate}
                onChange={e => handleFilterChange('maxRate', parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading companions...</div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(companion => (
                <Card key={companion.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {companion.user.first_name} {companion.user.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${companion.hourly_rate}/hour
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleFavorite(companion.id)}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {companion.expertise_areas.map((area, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-2 text-sm">
                          <div className="flex items-center mb-1">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1">{companion.rating}</span>
                          </div>
                          
                          <div className="space-y-1 mt-2">
                            <p className="flex items-center text-xs text-gray-600">
                              <span className="mr-2">Languages:</span>
                              {companion.languages.join(', ')}
                            </p>
                            <p className="flex items-center text-xs text-gray-600">
                              <span className="mr-2">Communication:</span>
                              {companion.communication_preferences.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t pt-3 px-4 pb-4">
                      <Button className="w-full">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No companions found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setFilters({
                  expertiseArea: "",
                  communicationType: "",
                  dementiaExperience: false,
                  mentalHealthSupport: false,
                  maxRate: 100,
                  supportTools: [],
                  dementiaOnly: false,
                })}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanionMatcher;
