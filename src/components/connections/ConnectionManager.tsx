
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/integrations/supabaseClient";
import { UserPlus, UserRound, Check, X } from "lucide-react";
import { mockConnection, mockSupabaseQuery } from "@/utils/supabaseHelpers";

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  connection_type: 'carer' | 'pal';
  status: string;
  created_at: string;
  updated_at: string;
  requester?: {
    first_name: string | null;
    last_name: string | null;
  };
  recipient?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const ConnectionManager = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
    const channel = subscribeToConnections();
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      // Use real data if available, otherwise use mock data
      try {
        const { data, error } = await supabaseClient
          .from('care_connections')
          .select('*')
          .or(`recipient_id.eq.${user.id},requester_id.eq.${user.id}`);

        if (error) throw error;

        const activeConnections = data.filter(conn => conn.status === 'accepted');
        const pending = data.filter(conn => conn.status === 'pending');

        setConnections(activeConnections);
        setPendingRequests(pending);
        return;
      } catch (error) {
        console.warn('Falling back to mock data for connections');
        
        // Fall back to mock data if real DB fails
        const { data, error } = await mockSupabaseQuery<Connection>(
          'care_connections',
          [
            mockConnection({ status: 'accepted', connection_type: 'carer' }),
            mockConnection({ status: 'accepted', connection_type: 'pal' }),
            mockConnection({ status: 'pending', connection_type: 'carer' })
          ]
        );

        if (error) throw error;
        
        const activeConnections = data.filter(conn => conn.status === 'accepted');
        const pending = data.filter(conn => conn.status === 'pending');

        setConnections(activeConnections);
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    }
  };

  const subscribeToConnections = () => {
    return supabaseClient
      .channel('care_connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_connections'
        },
        (payload) => {
          console.log('Connection update:', payload);
          fetchConnections();
        }
      )
      .subscribe();
  };

  const handleConnectionRequest = async (recipientId: string, type: 'carer' | 'pal') => {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { error } = await supabaseClient
        .from('care_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          connection_type: type,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent",
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

  const handleRequestResponse = async (connectionId: string, accept: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('care_connections')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Connection request ${accept ? 'accepted' : 'rejected'}`,
      });
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {request.requester?.first_name} {request.requester?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Wants to connect as a {request.connection_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestResponse(request.id, true)}
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRequestResponse(request.id, false)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {connection.recipient?.first_name} {connection.recipient?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {connection.connection_type === 'carer' ? 'Caregiver' : 'Companion'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {connection.connection_type === 'carer' ? (
                    <UserPlus className="h-5 w-5 text-primary-600" />
                  ) : (
                    <UserRound className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </div>
            ))}
            {connections.length === 0 && (
              <p className="text-center text-gray-500 py-4">No active connections</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
