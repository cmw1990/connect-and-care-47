
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LegalDisclaimer } from '@/components/disclaimers/LegalDisclaimer';
import { Check, Clock, Star, Video, User, Verified, MapPin, Heart, ExternalLink, AlertTriangle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { CompanionMatch } from '@/types/caregiver';

interface CompanionCardProps {
  companion: CompanionMatch;
  onConnect: (companionId: string) => void;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({ companion, onConnect }) => {
  const [showBioDialog, setShowBioDialog] = React.useState(false);
  const [showDisclaimerDialog, setShowDisclaimerDialog] = React.useState(false);

  // Instead of using the actual user property which has type issues,
  // we'll create a safe user object from the companion properties
  const safeUser = {
    first_name: companion.user?.first_name || "Companion",
    last_name: companion.user?.last_name || "User",
  };

  // Define a list of top skills based on companion properties
  const topSkills = [
    ...(companion.expertise_areas || []).slice(0, 2),
    ...(companion.mental_health_specialties || []).slice(0, 1),
  ];

  // Create a formatted list of activities
  const activities = companion.cognitive_engagement_activities?.memory_games || 
    companion.cognitive_engagement_activities?.brain_teasers || 
    companion.cognitive_engagement_activities?.social_activities || [];

  // Format the years of experience
  const backgroundCheckDate = companion.background_check_date 
    ? new Date(companion.background_check_date) 
    : null;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {safeUser.first_name} {safeUser.last_name}
            </CardTitle>
            <CardDescription>
              Companion & Mental Health Support
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{companion.rating || 4.8}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {/* Skills & Badges */}
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            
            {companion.identity_verified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                      <Verified className="h-3 w-3" />
                      Verified
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Identity verified and background checked
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Short bio or intro */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {companion.bio || "Experienced companion specializing in personalized care and emotional support."}
          </p>
          
          {/* Key information */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              <span>{companion.virtual_meeting_preference ? 'Virtual' : 'In-person'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span>${companion.hourly_rate}/hour</span>
            </div>
            
            {companion.dementia_experience && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                <span>Dementia Experienced</span>
              </div>
            )}
            
            {backgroundCheckDate && (
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-gray-500" />
                <span>Verified {format(backgroundCheckDate, 'MMM yyyy')}</span>
              </div>
            )}
          </div>
          
          {/* Activity examples */}
          {activities.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Engagement Activities:</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-300 pl-4 list-disc">
                {activities.slice(0, 2).map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col space-y-2">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setShowBioDialog(true)}
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onConnect(companion.id)}
          >
            <Heart className="h-3.5 w-3.5 mr-1.5" />
            Connect
          </Button>
        </div>
        
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-gray-500 p-0 h-auto"
          onClick={() => setShowDisclaimerDialog(true)}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Important Disclaimers
        </Button>
      </CardFooter>
      
      {/* Bio/Profile Dialog */}
      <Dialog open={showBioDialog} onOpenChange={setShowBioDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{safeUser.first_name} {safeUser.last_name}</DialogTitle>
            <DialogDescription>
              Companion & Mental Health Support
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="px-2 py-1">
                <Star className="h-3.5 w-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                {companion.rating || 4.8} Rating
              </Badge>
              
              {companion.dementia_experience && (
                <Badge variant="outline" className="px-2 py-1">
                  Dementia Experienced
                </Badge>
              )}
              
              {companion.identity_verified && (
                <Badge variant="outline" className="px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  <Verified className="h-3.5 w-3.5 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">About Me</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {companion.bio || 
                  "I'm an experienced companion dedicated to providing personalized care and emotional support. I focus on building meaningful connections and creating engaging activities tailored to individual needs and interests."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-1.5">
                  {companion.expertise_areas?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Meeting Preferences</h3>
                <div className="space-y-1">
                  {companion.virtual_meeting_preference && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Video className="h-3.5 w-3.5 text-gray-500" />
                      <span>Virtual Sessions</span>
                    </div>
                  )}
                  
                  {companion.in_person_meeting_preference && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                      <span>In-Person Sessions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Engagement Activities</h3>
              <div className="grid grid-cols-2 gap-2">
                {activities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start gap-1.5 text-sm">
                    <Check className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBioDialog(false)}>
              Close
            </Button>
            <Button onClick={() => onConnect(companion.id)}>
              <Heart className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimerDialog} onOpenChange={setShowDisclaimerDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Important Information</DialogTitle>
            <DialogDescription>
              Please review these important notes about companion services
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <LegalDisclaimer type="legal" />
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Companion Scope of Service</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Companions are not licensed healthcare providers and do not provide medical advice or services.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Companions do not replace professional mental health services.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>In case of emergency, always contact emergency services first.</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisclaimerDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
