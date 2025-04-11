
import { useState, useEffect } from "react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Check, X } from "lucide-react";
import { Connection } from "@/types/database.types";
import { transformConnectionData } from "@/utils/supabaseHelpers";

interface ConnectionManagerProps {
  userId: string;
}

export const ConnectionManager = ({ userId }: ConnectionManagerProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [connectionType, setConnectionType] = useState<"carer" | "pal">("carer");
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      // Fetch accepted connections
      const { data: acceptedData, error: acceptedError } = await supabaseClient
        .from("care_connections")
        .select(`
          id,
          requester_id,
          recipient_id,
          connection_type,
          status,
          created_at,
          updated_at,
          requester:requester_id (
            first_name,
            last_name
          ),
          recipient:recipient_id (
            first_name,
            last_name
          )
        `)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq("status", "accepted");

      // Fetch pending requests
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
          requester:requester_id (
            first_name,
            last_name
          ),
          recipient:recipient_id (
            first_name,
            last_name
          )
        `)
        .eq("recipient_id", userId)
        .eq("status", "pending");

      if (acceptedError) {
        console.error("Error fetching accepted connections:", acceptedError);
      } else {
        if (acceptedData) {
          const transformedConnections = transformConnectionData(acceptedData);
          setConnections(transformedConnections);
        }
      }

      if (pendingError) {
        console.error("Error fetching pending requests:", pendingError);
      } else {
        if (pendingData) {
          const transformedRequests = transformConnectionData(pendingData);
          setPendingRequests(transformedRequests);
        }
      }
    } catch (error) {
      console.error("Error in fetchConnections:", error);
      // For development, provide some sample data
      const mockConnections = [
        {
          id: "1",
          requester_id: userId,
          recipient_id: "user-2",
          connection_type: "carer",
          status: "accepted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          requester: { first_name: "Current", last_name: "User" },
          recipient: { first_name: "Jane", last_name: "Smith" }
        }
      ];
      
      const mockRequests = [
        {
          id: "2",
          requester_id: "user-3",
          recipient_id: userId,
          connection_type: "pal",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          requester: { first_name: "John", last_name: "Doe" },
          recipient: { first_name: "Current", last_name: "User" }
        }
      ];
      
      setConnections(mockConnections);
      setPendingRequests(mockRequests);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

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
      // First, look up the user by email
      const { data: users, error: userError } = await supabaseClient
        .from("profiles")
        .select("id, email")
        .eq("email", email.trim())
        .limit(1);

      if (userError) throw userError;

      if (!users?.length) {
        toast({
          title: "Error",
          description: "User not found with that email",
          variant: "destructive",
        });
        return;
      }

      const recipientId = users[0].id;

      // Send the connection request
      const { error } = await supabaseClient.from("care_connections").insert({
        requester_id: userId,
        recipient_id: recipientId,
        connection_type: connectionType,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent",
      });
      setEmail("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const { error } = await supabaseClient
        .from("care_connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request accepted",
      });
      fetchConnections();
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const { error } = await supabaseClient
        .from("care_connections")
        .update({ status: "rejected" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request rejected",
      });
      fetchConnections();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive",
      });
    }
  };

  const getConnectionName = (connection: Connection) => {
    const isRequester = connection.requester_id === userId;
    const person = isRequester ? connection.recipient : connection.requester;
    return `${person.first_name} ${person.last_name}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connections
        </CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Connect
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Pending Requests</h3>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{request.requester.first_name} {request.requester.last_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Wants to connect as a {request.connection_type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcceptRequest(request.id)}
                    className="bg-green-50 border-green-200 hover:bg-green-100"
                  >
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectRequest(request.id)}
                    className="bg-red-50 border-red-200 hover:bg-red-100"
                  >
                    <X className="mr-2 h-4 w-4 text-red-600" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-md font-semibold">Your Connections</h3>
          {connections.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No connections yet.</p>
            </div>
          ) : (
            connections.map((connection) => (
              <div
                key={connection.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{getConnectionName(connection)}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {connection.connection_type}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect with Someone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter their email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Connection Type</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={connectionType === "carer" ? "default" : "outline"}
                    onClick={() => setConnectionType("carer")}
                    className="flex-1"
                  >
                    Caregiver
                  </Button>
                  <Button
                    type="button"
                    variant={connectionType === "pal" ? "default" : "outline"}
                    onClick={() => setConnectionType("pal")}
                    className="flex-1"
                  >
                    Companion
                  </Button>
                </div>
              </div>
              <Button onClick={handleSendRequest} className="w-full">
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
