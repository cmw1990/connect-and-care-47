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
import { Plus } from "lucide-react";
import { CareComparison } from "@/components/comparison/CareComparison";
import { GroupsList } from "@/components/groups/GroupsList";
import type { CareGroup } from "@/types/groups";

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // First, get all groups the user has access to
      const { data: groupsData, error: groupsError } = await supabase
        .from('care_groups')
        .select('*');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }

      // Then, for each group, get the member count
      const groupsWithCount = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from('care_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return { 
            ...group, 
            member_count: count || 0 
          };
        })
      );

      setGroups(groupsWithCount);
    } catch (error) {
      console.error('Error in fetchGroups:', error);
      toast({
        title: "Error",
        description: "Failed to load care groups",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  const createGroup = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('care_groups')
        .insert([
          {
            name: newGroupName,
            description: newGroupDescription,
            created_by: session.user.id,
          }
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('care_group_members')
        .insert([
          {
            group_id: groupData.id,
            user_id: session.user.id,
            role: 'admin'
          }
        ]);

      if (memberError) throw memberError;

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
        description: "Failed to create care group",
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
          <h1 className="text-3xl font-bold text-gray-900">Care Groups</h1>
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

        <GroupsList groups={groups} />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Care Comparison</h2>
          <CareComparison />
        </div>
      </main>
    </div>
  );
};

export default Groups;