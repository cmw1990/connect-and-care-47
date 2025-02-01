import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users } from "lucide-react";
import { GroupsList } from "@/components/groups/GroupsList";
import { CareComparisonDialog } from "@/components/comparison/CareComparisonDialog";
import type { CareGroup } from "@/types/groups";

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        navigate("/auth");
        return;
      }

      const { data: groupsData, error: groupsError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          description,
          created_at,
          care_group_members!inner (
            user_id,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast({
          title: "Error",
          description: "Failed to load care groups. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!groupsData) {
        setGroups([]);
        return;
      }

      // Process groups to include member count
      const processedGroups = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: group.care_group_members?.length || 0
      }));

      setGroups(processedGroups);
    } catch (error) {
      console.error('Error in fetchGroups:', error);
      toast({
        title: "Error",
        description: "Failed to load care groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const createGroup = useCallback(async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from('care_groups')
        .insert([
          {
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            created_by: session.user.id,
          }
        ])
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        throw groupError;
      }

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('care_group_members')
        .insert([
          {
            group_id: newGroup.id,
            user_id: session.user.id,
            role: 'admin'
          }
        ]);

      if (memberError) {
        console.error('Error adding member:', memberError);
        throw memberError;
      }

      setNewGroupName("");
      setNewGroupDescription("");
      setIsDialogOpen(false);
      await fetchGroups();
      
      toast({
        title: "Success",
        description: "Care group created successfully",
      });
    } catch (error) {
      console.error('Error in createGroup:', error);
      toast({
        title: "Error",
        description: "Failed to create care group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newGroupName, newGroupDescription, navigate, toast, fetchGroups]);

  useEffect(() => {
    fetchGroups();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_groups'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGroups]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Care Groups</h1>
            <CareComparisonDialog />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Care Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                  />
                </div>
                <Button 
                  onClick={createGroup} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new care group.</p>
          </div>
        ) : (
          <GroupsList groups={groups} />
        )}
      </main>
    </div>
  );
};

export default Groups;