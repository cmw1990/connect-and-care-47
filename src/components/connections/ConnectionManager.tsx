
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, UserX, Shield, UserCheck } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { Connection } from "../checkins/social/SocialInteractions";
import { transformConnectionData } from "@/utils/supabaseHelpers";

interface ConnectionManagerProps {
  userId: string;
}

export const ConnectionManager = ({ userId }: ConnectionManagerProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabaseClient
          .from('care_connections')
          .select(`
            id,
            requester_id,
            recipient_id,
            connection_type,
            status,
            created_at,
            updated_at
          `)
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching connections:", error);
          return;
        }

        if (data) {
          const transformedData = transformConnectionData(data);
          const active = transformedData.filter(c => c.status === 'active');
          const pending = transformedData.filter(c => c.status === 'pending');
          
          setConnections(active);
          setPendingConnections(pending);
        }
      } catch (e) {
        const error = e as Error;
        console.error("Error in connections fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  const filteredConnections = connections.filter(connection => {
    const requesterName = `${connection.requester?.first_name} ${connection.requester?.last_name}`.toLowerCase();
    const recipientName = `${connection.recipient?.first_name} ${connection.recipient?.last_name}`.toLowerCase();
    const connectionType = connection.connection_type.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return requesterName.includes(query) || 
           recipientName.includes(query) || 
           connectionType.includes(query);
  });

  const acceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabaseClient
        .from('care_connections')
        .update({ status: 'active' })
        .eq('id', connectionId);

      if (error) throw error;

      // Update local state
      setPendingConnections(prev => prev.filter(c => c.id !== connectionId));
      const updatedConnection = pendingConnections.find(c => c.id === connectionId);
      if (updatedConnection) {
        const updated = { ...updatedConnection, status: 'active' };
        setConnections(prev => [...prev, updated]);
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const rejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabaseClient
        .from('care_connections')
        .update({ status: 'declined' })
        .eq('id', connectionId);

      if (error) throw error;

      // Update local state
      setPendingConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error("Error rejecting connection:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Connections</span>
          </div>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pendingConnections.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Pending Requests</h3>
              <div className="space-y-3">
                {pendingConnections.map(connection => (
                  <div 
                    key={connection.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/avatars/user-${Math.floor(Math.random() * 5) + 1}.png`} />
                        <AvatarFallback>
                          {connection.requester_id === userId 
                            ? (connection.recipient?.first_name?.[0] || 'U') 
                            : (connection.requester?.first_name?.[0] || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {connection.requester_id === userId 
                            ? `${connection.recipient?.first_name || 'User'} ${connection.recipient?.last_name || ''}` 
                            : `${connection.requester?.first_name || 'User'} ${connection.requester?.last_name || ''}`}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {connection.connection_type}
                        </p>
                      </div>
                    </div>
                    
                    {connection.recipient_id === userId && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => rejectConnection(connection.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => acceptConnection(connection.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}
                    
                    {connection.requester_id === userId && (
                      <Badge>Awaiting Response</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No connections found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "Try a different search term" : "Start by adding new connections"}
              </p>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Connection
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConnections.map(connection => (
                <div 
                  key={connection.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/user-${Math.floor(Math.random() * 5) + 1}.png`} />
                      <AvatarFallback>
                        {connection.requester_id === userId 
                          ? (connection.recipient?.first_name?.[0] || 'U') 
                          : (connection.requester?.first_name?.[0] || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {connection.requester_id === userId 
                          ? `${connection.recipient?.first_name || 'User'} ${connection.recipient?.last_name || ''}` 
                          : `${connection.requester?.first_name || 'User'} ${connection.requester?.last_name || ''}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {connection.connection_type}
                        </Badge>
                        {connection.connection_type === 'carer' && (
                          <Badge variant="outline" className="bg-blue-50">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
