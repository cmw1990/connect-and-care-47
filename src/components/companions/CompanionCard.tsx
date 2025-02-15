import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Globe, Music, Palette, Star, Video } from "lucide-react";
import { LegalDisclaimer } from "@/components/disclaimers/LegalDisclaimer";

interface CompanionCardProps {
  companion: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
    cognitive_engagement_activities?: {
      memory_games?: string[];
      brain_teasers?: string[];
      social_activities?: string[];
      creative_exercises?: string[];
    };
    cultural_competencies?: string[];
    music_therapy_certified?: boolean;
    art_therapy_certified?: boolean;
    rating?: number;
    hourly_rate?: number;
    dementia_care_certified?: boolean;
    dementia_care_experience_years?: number;
    cognitive_support_specialties?: string[];
  };
  onConnect: (id: string) => void;
}

export const CompanionCard = ({ companion, onConnect }: CompanionCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
        </div>

        <div className="space-y-4">
          {companion.dementia_care_certified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Dementia Care Certified
            </Badge>
          )}

          {companion.dementia_care_experience_years > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-500" />
              {companion.dementia_care_experience_years} years dementia care experience
            </div>
          )}

          {companion.cognitive_engagement_activities && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(companion.cognitive_engagement_activities).map(([key, activities]) => 
                activities && activities.length > 0 && (
                  <Badge key={key} variant="outline" className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                )
              )}
            </div>
          )}

          {companion.cultural_competencies && companion.cultural_competencies.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-blue-500" />
              <div className="flex flex-wrap gap-1">
                {companion.cultural_competencies.map((competency) => (
                  <Badge key={competency} variant="outline">
                    {competency}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {companion.music_therapy_certified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                Music Therapy
              </Badge>
            )}
            {companion.art_therapy_certified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Art Therapy
              </Badge>
            )}
          </div>

          {companion.cognitive_support_specialties && companion.cognitive_support_specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {companion.cognitive_support_specialties.map((specialty) => (
                <Badge key={specialty} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          <LegalDisclaimer type="platform_disclaimer" />

          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-semibold">
              ${companion.hourly_rate}/hr
            </span>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={() => onConnect(companion.id)}>
                Connect
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
