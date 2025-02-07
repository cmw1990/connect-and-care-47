import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Users, Heart } from "lucide-react";

interface ActivityTemplateCardProps {
  activity: {
    name: string;
    category: string;
    description?: string;
    duration_minutes?: number;
    difficulty_level?: string;
    cognitive_benefits?: string[];
    social_benefits?: string[];
    emotional_benefits?: string[];
  };
}

export const ActivityTemplateCard = ({ activity }: ActivityTemplateCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {activity.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{activity.description}</p>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{activity.duration_minutes} minutes</span>
          </div>

          {activity.difficulty_level && (
            <Badge variant="outline" className="capitalize">
              {activity.difficulty_level}
            </Badge>
          )}

          <div className="space-y-2">
            {activity.cognitive_benefits && activity.cognitive_benefits.length > 0 && (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <div className="flex flex-wrap gap-1">
                  {activity.cognitive_benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary" className="bg-purple-100 text-purple-800">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activity.social_benefits && activity.social_benefits.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div className="flex flex-wrap gap-1">
                  {activity.social_benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary" className="bg-blue-100 text-blue-800">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activity.emotional_benefits && activity.emotional_benefits.length > 0 && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <div className="flex flex-wrap gap-1">
                  {activity.emotional_benefits.map((benefit) => (
                    <Badge key={benefit} variant="secondary" className="bg-rose-100 text-rose-800">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};