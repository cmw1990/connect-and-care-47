
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Shield, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { VerificationBadge } from "../verification/VerificationBadge";

interface CaregiverCardProps {
  caregiver: any; // Replace with proper type
  onSelect?: (caregiver: any) => void;
}

export const CaregiverCard: React.FC<CaregiverCardProps> = ({ caregiver, onSelect }) => {
  const averageRating = caregiver.ratings?.reduce((acc: number, curr: any) => acc + curr.rating, 0) / (caregiver.ratings?.length || 1);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={caregiver.avatar_url} />
            <AvatarFallback>
              {caregiver.user?.first_name?.[0]}
              {caregiver.user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {caregiver.user?.first_name} {caregiver.user?.last_name}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-red-500 hover:text-red-600"
              >
                <Heart className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{caregiver.location?.city || "Location not specified"}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= averageRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({caregiver.ratings?.length || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {caregiver.background_check_verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          )}
          {caregiver.specializations?.map((spec: string) => (
            <Badge key={spec} variant="outline">
              {spec}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>${caregiver.hourly_rate}/hour</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{caregiver.experience_years}+ years exp.</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {caregiver.bio || "No bio provided"}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <Button
            className="flex-1"
            onClick={() => onSelect?.(caregiver)}
          >
            View Profile
          </Button>
          <Button
            variant="outline"
            className="flex-1"
          >
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
