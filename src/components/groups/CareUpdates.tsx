
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, MessageSquare } from "lucide-react";
import { supabaseClient } from "@/integrations/supabaseClient";
import { useState, useEffect } from "react";
import { CareUpdate } from "@/types/database.types";

interface CareUpdatesProps {
  groupId: string;
}

export const CareUpdates = ({ groupId }: CareUpdatesProps) => {
  const [updates, setUpdates] = useState<CareUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUpdates();
    subscribeToUpdates();
  }, [groupId]);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("care_updates")
        .select(`
          id,
          content,
          update_type,
          created_at,
          author_id,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Transform data to match CareUpdate type
        const transformedUpdates = data.map((update) => ({
          id: update.id,
          content: update.content,
          update_type: update.update_type,
          created_at: update.created_at,
          // Handle missing profiles data by providing default values
          profiles: update.profiles || { 
            first_name: 'Unknown', 
            last_name: 'User' 
          }
        }));
        
        setUpdates(transformedUpdates);
      } else {
        setUpdates([]);
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabaseClient
      .channel("care_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "care_updates",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log("New update:", payload);
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!newUpdate.trim()) return;

    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabaseClient.from("care_updates").insert({
        group_id: groupId,
        content: newUpdate.trim(),
        update_type: "general",
        author_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Update posted successfully",
      });
      setNewUpdate("");
      await fetchUpdates();
    } catch (error) {
      console.error("Error posting update:", error);
      toast({
        title: "Error",
        description: "Failed to post update",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Care Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Share an update about care..."
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {isLoading ? "Posting..." : "Post Update"}
          </Button>
        </div>
        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="p-4 rounded-lg border space-y-2"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">
                  {update.profiles?.first_name} {update.profiles?.last_name}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(update.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{update.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
