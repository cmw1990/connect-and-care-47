import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Search, UserPlus, UserRound } from "lucide-react";
import { GroupsList } from "@/components/groups/GroupsList";
import { CaregiverCard } from "@/components/caregivers/CaregiverCard";
import { CompanionCard } from "@/components/companions/CompanionCard";
import { CareTeamPresence } from "@/components/groups/CareTeamPresence";
import { CareQualityMetrics } from "@/components/metrics/CareQualityMetrics";
import { CareUpdates } from "@/components/groups/CareUpdates";
import { WellnessTracker } from "@/components/wellness/WellnessTracker";
import { CareTeamCalendar } from "@/components/calendar/CareTeamCalendar";
import { ConnectionManager } from "@/components/connections/ConnectionManager";
import type { CareGroup, GroupPrivacySettings } from "@/types/groups";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [myGroups, setMyGroups] = useState<CareGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<CareGroup | null>(null);
  const [activeTab, setActiveTab] = useState("my-groups");
  const [caregivers, setCaregivers] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view groups",
          variant: "destructive",
        });
        return;
      }

      const { data: memberGroups, error: memberError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          description,
          created_at,
          created_by,
          privacy_settings,
          care_group_members!inner (
            id,
            role
          )
        `)
        .eq('care_group_members.user_id', user.id);

      if (memberError) throw memberError;

      const formattedMemberGroups = memberGroups?.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: group.care_group_members?.length || 0,
        is_owner: group.created_by === user.id,
        is_public: ((group.privacy_settings as unknown) as GroupPrivacySettings)?.visibility === 'public'
      })) || [];

      setMyGroups(formattedMemberGroups);

      const { data: publicGroups, error: publicError } = await supabase
        .from('care_groups')
        .select(`
          id,
          name,
          description,
          created_at,
          privacy_settings,
          care_group_members (
            id
          )
        `)
        .eq('privacy_settings->>visibility', 'public');

      if (publicError) throw publicError;

      const formattedPublicGroups = publicGroups?.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: group.care_group_members?.length || 0,
        is_public: true
      })) || [];

      setGroups(formattedPublicGroups);
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

  const fetchCaregivers = async () => {
    const { data, error } = await supabase
      .from('caregiver_profiles')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .ilike('skills', `%${searchQuery}%`);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load caregivers",
        variant: "destructive",
      });
    } else {
      setCaregivers(data);
    }
  };

  const fetchCompanions = async () => {
    const { data, error } = await supabase
      .from('companion_profiles')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .ilike('interests', `%${searchQuery}%`);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load companions",
        variant: "destructive",
      });
    } else {
      setCompanions(data);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (activeTab === 'caregivers') {
      fetchCaregivers();
    } else if (activeTab === 'companions') {
      fetchCompanions();
    }
  }, [activeTab, searchQuery]);

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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingGroup) {
        const { error } = await supabase
          .from('care_groups')
          .update({
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            privacy_settings: { visibility: isPublic ? 'public' : 'private' }
          })
          .eq('id', editingGroup.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Care group updated successfully",
        });
      } else {
        const { data: group, error: groupError } = await supabase
          .from('care_groups')
          .insert({
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            created_by: user.id,
            privacy_settings: { visibility: isPublic ? 'public' : 'private' }
          })
          .select()
          .single();

        if (groupError) throw groupError;

        const { error: memberError } = await supabase
          .from('care_group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
          });

        if (memberError) throw memberError;

        toast({
          title: "Success",
          description: "Care group created successfully",
        });
        
        navigate(`/groups/${group.id}`);
      }

      setNewGroupName("");
      setNewGroupDescription("");
      setIsPublic(false);
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
  }, [newGroupName, newGroupDescription, isPublic, editingGroup, toast, fetchGroups, navigate]);

  const handleEdit = (group: CareGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('care_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      
      await fetchGroups();
      
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete care group",
        variant: "destructive",
      });
    }
  };

  const handleCompanionConnect = async (companionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to connect with companions",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('care_connections')
        .insert({
          requester_id: user.id,
          recipient_id: companionId,
          connection_type: 'pal',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent successfully",
      });
    } catch (error) {
      console.error('Error connecting with companion:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary-600" />
              Care Network
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  {editingGroup ? 'Edit Care Group' : 'Create New Care Group'}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup 
                    ? 'Update your care group details below.' 
                    : 'Create a new care group to collaborate with others.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                    className="w-full"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Make group public</Label>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      {editingGroup ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    editingGroup ? "Update Group" : "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search caregivers, companions, or groups..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-white shadow-sm">
            <TabsTrigger value="my-groups" className="data-[state=active]:bg-primary-100">
              <Users className="h-4 w-4 mr-2" />
              My Care Groups
            </TabsTrigger>
            <TabsTrigger value="caregivers" className="data-[state=active]:bg-primary-100">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Caregivers
            </TabsTrigger>
            <TabsTrigger value="companions" className="data-[state=active]:bg-primary-100">
              <UserRound className="h-4 w-4 mr-2" />
              Find Companions
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-primary-100">
              <Users className="h-4 w-4 mr-2" />
              My Connections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : myGroups.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-lg shadow-sm"
              >
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No groups yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new care group.</p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Group
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {myGroups.map((group) => (
                  <div key={group.id} className="mb-8 animate-fade-in">
                    <GroupsList 
                      groups={[group]}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                    <div className="mt-4 space-y-4">
                      <CareRecipientManager groupId={group.id} />
                      <CareTeamPresence groupId={group.id} />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CareUpdates groupId={group.id} />
                        <WellnessTracker groupId={group.id} />
                      </div>
                      <CareTeamCalendar groupId={group.id} />
                      <CareQualityMetrics groupId={group.id} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="caregivers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caregivers.map((caregiver) => (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="companions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companions.map((companion) => (
                <CompanionCard
                  key={companion.id}
                  companion={companion}
                  onConnect={handleCompanionConnect}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <ConnectionManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Groups;
