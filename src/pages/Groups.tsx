import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { wpApi, type WPCareGroup } from "@/integrations/wordpress/client";
import type { CareGroup } from "@/types/groups";

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<CareGroup | null>(null);

  // Convert WordPress groups to our app's format
  const convertWPGroupToAppFormat = (wpGroup: WPCareGroup): CareGroup => ({
    id: wpGroup.id.toString(),
    name: wpGroup.title.rendered,
    description: wpGroup.content.rendered.replace(/<[^>]*>/g, ''),
    created_at: new Date().toISOString(), // WP might provide this in the response
    member_count: wpGroup.meta?.member_count || 0,
  });

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      const wpGroups = await wpApi.getCareGroups();
      const formattedGroups = wpGroups.map(convertWPGroupToAppFormat);
      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to load care groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSubmit = useCallback(async () => {
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
      if (editingGroup) {
        await wpApi.updateCareGroup(Number(editingGroup.id), {
          title: newGroupName.trim(),
          content: newGroupDescription.trim(),
        });
        toast({
          title: "Success",
          description: "Care group updated successfully",
        });
      } else {
        await wpApi.createCareGroup({
          title: newGroupName.trim(),
          content: newGroupDescription.trim(),
        });
        toast({
          title: "Success",
          description: "Care group created successfully",
        });
      }

      setNewGroupName("");
      setNewGroupDescription("");
      setIsDialogOpen(false);
      setEditingGroup(null);
      await fetchGroups();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingGroup ? 'update' : 'create'} care group. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newGroupName, newGroupDescription, editingGroup, toast, fetchGroups]);

  const handleEdit = (group: CareGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (groupId: string) => {
    await fetchGroups();
  };

  useEffect(() => {
    fetchGroups();
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingGroup(null);
              setNewGroupName("");
              setNewGroupDescription("");
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? 'Edit Care Group' : 'Create New Care Group'}
                </DialogTitle>
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
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (editingGroup ? "Updating..." : "Creating...") : (editingGroup ? "Update Group" : "Create Group")}
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
          <GroupsList 
            groups={groups} 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </main>
    </div>
  );
};

export default Groups;