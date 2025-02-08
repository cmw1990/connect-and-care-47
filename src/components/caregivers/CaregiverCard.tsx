
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star, Clock, Shield, Calendar, Baby, Dog, Brain, Heart } from "lucide-react";
import { DirectMessageChat } from "@/components/chat/DirectMessageChat";
import { LegalDisclaimer } from "@/components/disclaimers/LegalDisclaimer";

interface CaregiverCardProps {
  caregiver: {
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
    age_groups_experience?: string[];
    pet_types_experience?: string[];
    special_needs_certifications?: any[];
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export const CaregiverCard = ({ caregiver }: CaregiverCardProps) => {
  const fullName = `${caregiver.user.first_name} ${caregiver.user.last_name}`;
  
  const renderSpecializations = () => {
    if (caregiver.age_groups_experience?.length) {
      return (
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 text-blue-500" />
          <span>Age Groups: {caregiver.age_groups_experience.join(', ')}</span>
        </div>
      );
    }
    if (caregiver.pet_types_experience?.length) {
      return (
        <div className="flex items-center gap-2">
          <Dog className="h-4 w-4 text-green-500" />
          <span>Pet Types: {caregiver.pet_types_experience.join(', ')}</span>
        </div>
      );
    }
    if (caregiver.special_needs_certifications?.length) {
      return (
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <span>Special Needs Certified</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{fullName}</span>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{caregiver.rating}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{caregiver.experience_years} years experience</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className={caregiver.identity_verified ? "text-green-600" : "text-gray-500"}>
              {caregiver.identity_verified ? "Verified" : "Not verified"}
            </span>
          </div>

          {renderSpecializations()}

          <p className="text-sm text-gray-600">{caregiver.bio}</p>

          <div className="flex flex-wrap gap-2">
            {caregiver.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>

          <LegalDisclaimer type="platform_disclaimer" />

          <div className="flex justify-between items-center pt-4">
            <span className="font-semibold">${caregiver.hourly_rate}/hr</span>
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
                    recipientId={caregiver.user_id}
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
