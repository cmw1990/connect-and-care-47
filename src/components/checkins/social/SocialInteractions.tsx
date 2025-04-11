
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserPlus, Users } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { transformConnectionData } from "@/utils/supabaseHelpers";

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  connection_type: 'carer' | 'pal';
  status: string;
  created_at: string;
  updated_at: string;
  requester?: {
    first_name: string;
    last_name: string;
  };
  recipient?: {
    first_name: string;
    last_name: string;
  };
}

interface SocialInteractionsProps {
  userId: string;
}

export const SocialInteractions = ({ userId }: SocialInteractionsProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
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
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching connections:", error);
          return;
        }

        if (data) {
          const transformedData = transformConnectionData(data);
          setConnections(transformedData);
        }
      } catch (error) {
        console.error("Error in connections fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  const getInitials = (name: string = "") => {
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">No connections found</p>
            <div className="flex justify-center">
              <button className="flex items-center gap-1 text-primary hover:underline">
                <UserPlus className="h-4 w-4" />
                Add new connection
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={`/avatars/user-${Math.floor(Math.random() * 5) + 1}.png`} />
                  <AvatarFallback>
                    {getInitials(connection.requester_id === userId 
                      ? (connection.recipient?.first_name || 'U')
                      : (connection.requester?.first_name || 'U'))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {connection.requester_id === userId 
                          ? `${connection.recipient?.first_name || 'User'} ${connection.recipient?.last_name || ''}`
                          : `${connection.requester?.first_name || 'User'} ${connection.requester?.last_name || ''}`}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {connection.connection_type}
                      </p>
                    </div>
                    <Badge variant={
                      connection.status === "active" ? "success" : 
                      connection.status === "pending" ? "secondary" : "destructive"
                    }>
                      {connection.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Connected {new Date(connection.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
