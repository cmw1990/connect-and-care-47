
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Phone, Video, PersonStanding, UserPlus, UserRound, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockConnection, mockSupabaseQuery } from "@/utils/supabaseHelpers";

interface SocialInteractionsProps {
  interactions: string[];
  onInteractionAdd: (type: string) => void;
}

interface Connection {
  id: string;
  connection_type: 'carer' | 'pal';
  status: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  recipient_id: string;
  requester?: {
    first_name: string | null;
    last_name: string | null;
  };
  recipient?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const SocialInteractions = ({ interactions, onInteractionAdd }: SocialInteractionsProps) => {
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  const { toast } = useToast();

  const interactionTypes = [
    { type: 'in-person', icon: PersonStanding, label: 'In-Person Visit' },
    { type: 'phone', icon: Phone, label: 'Phone Call' },
    { type: 'video', icon: Video, label: 'Video Call' },
    { type: 'group', icon: Users, label: 'Group Activity' },
  ];

  useEffect(() => {
    fetchRecentConnections();
    fetchSuggestedConnections();
    subscribeToConnectionUpdates();
  }, []);

  const fetchRecentConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use mock data for development since the table doesn't exist yet
      const { data, error } = await mockSupabaseQuery<Connection>(
        'care_connections',
        [
          mockConnection({ status: 'accepted', connection_type: 'carer' }),
          mockConnection({ status: 'pending', connection_type: 'pal' })
        ]
      );

      if (error) throw error;
      // Ensure data is properly typed as Connection[]
      setRecentConnections(data as Connection[]);
    } catch (error) {
      console.error('Error fetching recent connections:', error);
    }
  };

  const fetchSuggestedConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock suggested connections
      const mockSuggestions = [
        { id: '1', first_name: 'John', last_name: 'Doe', user_type: 'professional_caregiver' },
        { id: '2', first_name: 'Jane', last_name: 'Smith', user_type: 'companion' },
        { id: '3', first_name: 'Alex', last_name: 'Johnson', user_type: 'family_member' }
      ];
      
      setSuggestedConnections(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggested connections:', error);
    }
  };

  const subscribeToConnectionUpdates = () => {
    const channel = supabase
      .channel('care_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_connections'
        },
        (payload) => {
          console.log('Connection update:', payload);
          fetchRecentConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendConnectionRequest = async (recipientId: string, type: 'carer' | 'pal') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('care_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          connection_type: type,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type === 'carer' ? 'Caregiver' : 'Companion'} connection request sent`,
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {recentConnections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Connections</h4>
            <div className="space-y-2">
              {recentConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {connection.connection_type === 'carer' ? (
                      <UserPlus className="h-4 w-4 text-primary-600" />
                    ) : (
                      <UserRound className="h-4 w-4 text-primary-600" />
                    )}
                    <span className="text-sm">
                      {connection.recipient?.first_name} {connection.recipient?.last_name}
                    </span>
                  </div>
                  <Badge variant={connection.status === 'accepted' ? 'default' : 'secondary'}>
                    {connection.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestedConnections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Connections</h4>
            <div className="space-y-2">
              {suggestedConnections.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profile.user_type === 'professional_caregiver' ? 'Caregiver' : 'Companion'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary-600"
                      onClick={() => sendConnectionRequest(profile.id, 'carer')}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary-600"
                      onClick={() => sendConnectionRequest(profile.id, 'pal')}
                    >
                      <UserRound className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
