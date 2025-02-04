import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, Video, Globe, Calendar } from "lucide-react";
import { DirectMessageChat } from "@/components/chat/DirectMessageChat";

interface CompanionCardProps {
  companion: {
    id: string;
    user_id: string;
    bio: string;
    interests: string[];
    languages: string[];
    hourly_rate: number;
    rating: number;
    virtual_meeting_preference: boolean;
    in_person_meeting_preference: boolean;
    identity_verified: boolean;
    expertise_areas: string[];
    dementia_experience: boolean;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export const CompanionCard = ({ companion }: CompanionCardProps) => {
  const fullName = `${companion.user.first_name} ${companion.user.last_name}`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{fullName}</span>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{companion.rating}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {companion.virtual_meeting_preference && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                Virtual
              </span>
            )}
            {companion.in_person_meeting_preference && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                In-person
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600">{companion.bio}</p>

          <div className="flex flex-wrap gap-2">
            {companion.expertise_areas.map((area, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
              >
                {area}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {companion.languages.map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {language}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="font-semibold">${companion.hourly_rate}/hr</span>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DirectMessageChat
                    recipientId={companion.user_id}
                    recipientName={fullName}
                  />
                </DialogContent>
              </Dialog>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Book
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};