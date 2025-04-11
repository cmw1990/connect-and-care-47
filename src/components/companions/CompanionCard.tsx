
import { useState } from "react";
import { CheckCircle, Star, Clock, Calendar, Shield, Languages, BrainCircuit, Heart, Users, FileCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanionMatch } from "@/types/supabase";

interface CompanionCardProps {
  companion: CompanionMatch;
  onConnect: (companionId: string) => void;
}

export const CompanionCard = ({ companion, onConnect }: CompanionCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Format verification date if it exists
  const formatVerificationDate = () => {
    if (!companion.background_check_date) {
      return 'Not verified';
    }
    
    return new Date(companion.background_check_date).toLocaleDateString();
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {companion.user.first_name} {companion.user.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                ${companion.hourly_rate}/hour
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{companion.rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3">
            {companion.identity_verified && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                <Shield className="h-3 w-3 text-blue-500" />
                Verified
              </Badge>
            )}
            
            <div className="text-sm text-muted-foreground line-clamp-3">
              {companion.bio || "No bio available."}
            </div>
            
            <div className="pt-2">
              <h4 className="text-xs font-medium mb-1 text-muted-foreground">Expertise</h4>
              <div className="flex flex-wrap gap-1">
                {companion.expertise_areas.slice(0, 3).map((expertise, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {expertise}
                  </Badge>
                ))}
                {companion.expertise_areas.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{companion.expertise_areas.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
            View Details
          </Button>
          <Button size="sm" onClick={() => onConnect(companion.id)}>
            Connect
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {companion.user.first_name} {companion.user.last_name}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span>{companion.rating.toFixed(1)}</span>
                </div>
                {companion.identity_verified && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                    <Shield className="h-3 w-3 text-blue-500" />
                    Verified ({formatVerificationDate()})
                  </Badge>
                )}
                <Badge variant="outline">${companion.hourly_rate}/hr</Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="about" className="flex flex-col flex-grow overflow-hidden">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-grow pr-4">
              <TabsContent value="about" className="space-y-4 mt-0">
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-muted-foreground">
                    {companion.bio || "No bio available."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-1">
                    {companion.expertise_areas.map((expertise, i) => (
                      <Badge key={i} variant="secondary">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Languages</h3>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {companion.languages.length > 0
                        ? companion.languages.join(", ")
                        : "English"}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Meeting Preferences</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {companion.virtual_meeting_preference && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Virtual</span>
                      </div>
                    )}
                    {companion.in_person_meeting_preference && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>In-person</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="experience" className="space-y-4 mt-0">
                {companion.mental_health_specialties.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Mental Health Support</h3>
                    <div className="flex flex-wrap gap-1">
                      {companion.mental_health_specialties.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {companion.dementia_experience && (
                  <div>
                    <h3 className="font-medium mb-2">Dementia Experience</h3>
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-purple-500" />
                      <span>Experienced in dementia care</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Certifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {companion.music_therapy_certified && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Music Therapy</span>
                      </div>
                    )}
                    {companion.art_therapy_certified && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Art Therapy</span>
                      </div>
                    )}
                    {!companion.music_therapy_certified && !companion.art_therapy_certified && (
                      <span className="text-muted-foreground">No certifications listed</span>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activities" className="space-y-4 mt-0">
                <div>
                  <h3 className="font-medium mb-2">Cognitive Engagement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(companion.cognitive_engagement_activities).map(([category, items]) => (
                      items && items.length > 0 ? (
                        <div key={category} className="border rounded-lg p-3">
                          <h4 className="font-medium text-sm capitalize mb-2">
                            {category.replace(/_/g, " ")}
                          </h4>
                          <ul className="text-sm space-y-1">
                            {items.slice(0, 3).map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                            {items.length > 3 && (
                              <li className="text-muted-foreground">
                                +{items.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
                
                {companion.interests.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-1">
                      {companion.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="availability" className="space-y-4 mt-0">
                <div>
                  <h3 className="font-medium mb-2">Typical Availability</h3>
                  {companion.availability ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(companion.availability).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{day}: </span>
                          <span className="text-muted-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Contact for availability information
                    </p>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button onClick={() => {
              onConnect(companion.id);
              setShowDetails(false);
            }}>
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
