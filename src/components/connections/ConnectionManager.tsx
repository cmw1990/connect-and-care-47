
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, UserCheck, Clock, ArrowRight } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { transformConnectionData } from "@/utils/supabaseHelpers";
import { Connection } from "@/types/database.types";

interface ConnectionManagerProps {
  userId: string;
}

export const ConnectionManager = ({ userId }: ConnectionManagerProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [email, setEmail] = useState("");
  const [connectionType, setConnectionType] = useState<"carer" | "pal">("carer");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const fetchConnections = async () => {
    try {
      // Fetch active connections (accepted)
      const { data: activeData, error: activeError } = await supabaseClient
        .from("care_connections")
        .select(`
          id,
          requester_id,
          recipient_id,
          connection_type,
          status,
          created_at,
          updated_at,
          requester:profiles!fk_requester_id(
            first_name,
            last_name
          ),
          recipient:profiles!fk_recipient_id(
            first_name,
            last_name
          )
        `)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq("status", "accepted");

      // Fetch pending connections
      const { data: pendingData, error: pendingError } = await supabaseClient
        .from("care_connections")
        .select(`
          id,
          requester_id,
          recipient_id,
          connection_type,
          status,
          created_at,
          updated_at,
          requester:profiles!fk_requester_id(
            first_name,
            last_name
          ),
          recipient:profiles!fk_recipient_id(
            first_name,
            last_name
          )
        `)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq("status", "pending");

      if (activeError) throw activeError;
      if (pendingError) throw pendingError;

      // Transform the data to match our expected Connection type
      const transformedActive = transformConnectionData(activeData || []);
      const transformedPending = transformConnectionData(pendingData || []);
      
      setConnections(transformedActive);
      setPendingConnections(transformedPending);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSendRequest = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user exists
      const { data: userExists, error: userError } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("email", email.trim())
        .single();
      
      if (userError || !userExists) {
        toast({
          title: "Error",
          description: "User not found with this email address",
          variant: "destructive",
        });
        return;
      }
      
      // Check if connection already exists
      const { data: existingConn, error: connError } = await supabaseClient
        .from("care_connections")
        .select("*")
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${userExists.id}),and(requester_id.eq.${userExists.id},recipient_id.eq.${userId})`)
        .maybeSingle();
      
      if (existingConn) {
        toast({
          title: "Error",
          description: "A connection with this user already exists",
          variant: "destructive",
        });
        return;
      }
      
      // Create connection request
      const { error: insertError } = await supabaseClient
        .from("care_connections")
        .insert({
          requester_id: userId,
          recipient_id: userExists.id,
          connection_type: connectionType,
          status: "pending"
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
      setEmail("");
      fetchConnections();
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, action: "accept" | "reject") => {
    try {
      if (action === "accept") {
        const { error } = await supabaseClient
          .from("care_connections")
          .update({ status: "accepted" })
          .eq("id", connectionId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Connection accepted successfully",
        });
      } else {
        const { error } = await supabaseClient
          .from("care_connections")
          .update({ status: "rejected" })
          .eq("id", connectionId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Connection rejected successfully",
        });
      }
      
      fetchConnections();
    } catch (error) {
      console.error(`Error ${action}ing connection:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} connection. Please try again later.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Send Connection Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Connection Type</label>
              <Select value={connectionType} onValueChange={(value: "carer" | "pal") => setConnectionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carer">Caregiver</SelectItem>
                  <SelectItem value="pal">Care Pal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSendRequest} 
              disabled={isLoading}
              className="w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex flex-col mb-2 md:mb-0">
                    <h3 className="font-medium">
                      {connection.requester_id === userId 
                        ? `${connection.recipient.first_name} ${connection.recipient.last_name}` 
                        : `${connection.requester.first_name} ${connection.requester.last_name}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {connection.requester_id === userId 
                        ? "Request Sent" 
                        : "Request Received"}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {connection.connection_type === "carer" ? "Caregiver" : "Care Pal"}
                    </div>
                  </div>
                  
                  {connection.requester_id !== userId && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConnectionAction(connection.id, "accept")}
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleConnectionAction(connection.id, "reject")}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Active Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No active connections yet
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex flex-col mb-2 md:mb-0">
                    <h3 className="font-medium">
                      {connection.requester_id === userId 
                        ? `${connection.recipient.first_name} ${connection.recipient.last_name}` 
                        : `${connection.requester.first_name} ${connection.requester.last_name}`}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {connection.connection_type === "carer" ? "Caregiver" : "Care Pal"}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Profile
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
