import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShieldCheck, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanionCardProps {
  companion: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
    bio: string;
    hourly_rate: number;
    rating: number;
    interests: string[];
    languages: string[];
    virtual_meeting_preference: boolean;
    in_person_meeting_preference: boolean;
  };
  onBook?: () => void;
}

export const CompanionCard = ({ companion, onBook }: CompanionCardProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBook = async () => {
    setIsLoading(true);
    try {
      if (onBook) {
        await onBook();
      }
      toast({
        title: "Success",
        description: "Meeting request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send meeting request",
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
            <span>•</span>
            <span>{companion.languages.join(", ")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{companion.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {companion.interests.map((interest) => (
            <Badge key={interest} variant="secondary">
              {interest}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Local Area</span>
          </div>
          <div className="flex gap-2">
            {companion.virtual_meeting_preference && (
              <Badge variant="outline">Virtual</Badge>
            )}
            {companion.in_person_meeting_preference && (
              <Badge variant="outline">In-Person</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          ${companion.hourly_rate}/hr
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Button>
          <Button onClick={handleBook} disabled={isLoading}>
            Schedule Meeting
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};