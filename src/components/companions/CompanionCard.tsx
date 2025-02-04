import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Video, Heart, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConsultationScheduler } from "@/components/consultations/ConsultationScheduler";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CompanionCardProps {
  companion: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
    bio: string;
    interests: string[];
    languages: string[];
    hourly_rate: number;
    rating: number;
    expertise_areas: string[];
    virtual_meeting_preference: boolean;
    in_person_meeting_preference: boolean;
    identity_verified: boolean;
  };
  onConnect?: () => void;
}

export const CompanionCard = ({ companion, onConnect }: CompanionCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (onConnect) {
        await onConnect();
      }
      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${companion.id}`} />
          <AvatarFallback>{companion.user.first_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {companion.user.first_name} {companion.user.last_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{companion.rating}/5</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{companion.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {companion.expertise_areas.map((area) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {companion.languages.map((language) => (
            <Badge key={language} variant="outline">
              {language}
            </Badge>
          ))}
        </div>
        {companion.identity_verified && (
          <div className="flex items-center gap-1 text-green-600">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Identity</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          ${companion.hourly_rate}/hr
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ConsultationScheduler 
                providerId={companion.id}
                providerType="companion"
              />
            </DialogContent>
          </Dialog>
          <Button onClick={handleConnect} disabled={isLoading}>
            <Heart className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};