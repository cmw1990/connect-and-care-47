
import { useState, useEffect } from "react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, User, Users } from "lucide-react";
import { Connection } from "@/types/database.types";
import { transformConnectionData } from "@/utils/supabaseHelpers";

interface SocialInteractionsProps {
  userId: string;
}

export const SocialInteractions = ({ userId }: SocialInteractionsProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [interactionNote, setInteractionNote] = useState("");
  const [interactionDate, setInteractionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchConnections = async () => {
    try {
      // First check if the table exists
      const { data, error } = await supabaseClient
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

      if (error) {
        console.error("Error fetching connections:", error);
        // For development, provide mock data
        setConnections([
          {
            id: "1",
            requester_id: userId,
            recipient_id: "user-2",
            connection_type: "carer",
            status: "accepted",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            requester: {
              first_name: "Current",
              last_name: "User"
            },
            recipient: {
              first_name: "Jane",
              last_name: "Smith"
            }
          }
        ]);
      } else {
        if (data && data.length > 0) {
          // Transform data to match the Connection type
          const transformedConnections = transformConnectionData(data);
          setConnections(transformedConnections);
        } else {
          // Provide mock data for development
          setConnections([
            {
              id: "1",
              requester_id: userId,
              recipient_id: "user-2",
              connection_type: "carer",
              status: "accepted",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              requester: {
                first_name: "Current",
                last_name: "User"
              },
              recipient: {
                first_name: "Jane",
                last_name: "Smith"
              }
            }
          ]);
        }
      }
    } catch (error) {
      console.error("Error in fetchConnections:", error);
      // Provide mock data for development
      setConnections([
        {
          id: "1",
          requester_id: userId,
          recipient_id: "user-2",
          connection_type: "carer",
          status: "accepted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          requester: {
            first_name: "Current",
            last_name: "User"
          },
          recipient: {
            first_name: "Jane",
            last_name: "Smith"
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const handleLogInteraction = async () => {
    if (!selectedConnection || !interactionNote.trim()) return;

    try {
      // Use the social_interactions table if it exists
      // For now just log to console since we don't have that table yet
      console.log("Social interaction logged:", {
        connection_id: selectedConnection,
        note: interactionNote,
        date: interactionDate,
        logged_by: userId
      });

      // Clear form
      setInteractionNote("");
      setInteractionDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error logging interaction:", error);
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.length === 0 ? (
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground">No connections found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Person</label>
              <select
                className="w-full border rounded-md p-2"
                value={selectedConnection || ""}
                onChange={(e) => setSelectedConnection(e.target.value)}
              >
                <option value="">Select a person</option>
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {getConnectionName(connection)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={interactionDate}
                  onChange={(e) => setInteractionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interaction Notes</label>
              <Textarea
                placeholder="What did you talk about? How was their mood?"
                value={interactionNote}
                onChange={(e) => setInteractionNote(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleLogInteraction}
              disabled={!selectedConnection || !interactionNote.trim()}
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Log Interaction
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
