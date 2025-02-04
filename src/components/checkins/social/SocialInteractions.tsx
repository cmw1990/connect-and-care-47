import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Phone, Video, PersonStanding } from "lucide-react";

interface SocialInteractionsProps {
  interactions: string[];
  onInteractionAdd: (type: string) => void;
}

export const SocialInteractions = ({ interactions, onInteractionAdd }: SocialInteractionsProps) => {
  const interactionTypes = [
    { type: 'in-person', icon: PersonStanding, label: 'In-Person Visit' },
    { type: 'phone', icon: Phone, label: 'Phone Call' },
    { type: 'video', icon: Video, label: 'Video Call' },
    { type: 'group', icon: Users, label: 'Group Activity' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {interactionTypes.map((interaction) => (
            <Button
              key={interaction.type}
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onInteractionAdd(interaction.type)}
            >
              <interaction.icon className="h-4 w-4" />
              {interaction.label}
            </Button>
          ))}
        </div>
        {interactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Today's Interactions</h4>
            <div className="space-y-1">
              {interactions.map((interaction, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"
                >
                  {interaction}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};