import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShieldCheck, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaregiverCardProps {
  caregiver: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
    bio: string;
    hourly_rate: number;
    rating: number;
    experience_years: number;
    skills: string[];
    background_check_status: string;
  };
  onBook?: () => void;
}

export const CaregiverCard = ({ caregiver, onBook }: CaregiverCardProps) => {
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
        description: "Booking request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send booking request",
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
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caregiver.id}`} />
          <AvatarFallback>{caregiver.user.first_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {caregiver.user.first_name} {caregiver.user.last_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{caregiver.rating}/5</span>
            <span>•</span>
            <span>{caregiver.experience_years} years experience</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{caregiver.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {caregiver.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>5 miles away</span>
          </div>
          {caregiver.background_check_status === 'verified' && (
            <div className="flex items-center gap-1 text-green-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          ${caregiver.hourly_rate}/hr
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Button>
          <Button onClick={handleBook} disabled={isLoading}>
            Book Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};