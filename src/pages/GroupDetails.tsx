import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Settings, BookOpen, ArrowLeft, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { CareGroup } from "@/types/groups";
import { GroupCalendar } from "@/components/groups/GroupCalendar";
import { GroupPosts } from "@/components/groups/GroupPosts";
import { GroupTasks } from "@/components/groups/GroupTasks";
import { GroupStatusBar } from "@/components/groups/GroupStatusBar";
import { PatientInfoCard } from "@/components/groups/PatientInfoCard";
import { CareAssistant } from "@/components/ai/CareAssistant";
import { MiniStatusIndicator } from "@/components/groups/MiniStatusIndicator";
import { MiniCalendar } from "@/components/groups/MiniCalendar";

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<CareGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'tasks' | 'info'>('posts');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('care_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      if (!groupData) {
        navigate('/groups');
        return;
      }

      // Transform the data to match CareGroup type
      const transformedGroup: CareGroup = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        created_at: groupData.created_at,
        privacy_settings: groupData.privacy_settings as CareGroup['privacy_settings']
      };

      setGroup(transformedGroup);

      // Fetch group members with their profiles
      const { data: membersData, error: membersError } = await supabase
        .from('care_group_members')
        .select(`
          id,
          user_id,
          role,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      setMembers(membersData);

      // Fetch patient info - using maybeSingle() instead of single()
      const { data: patientData, error: patientError } = await supabase
        .from('patient_info')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle();

      if (patientError) {
        console.error('Error fetching patient info:', patientError);
        toast({
          title: "Error",
          description: "Failed to load patient information",
          variant: "destructive",
        });
      } else {
        setPatientInfo(patientData);
      }

    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingMember(true);

      // First, find the user by email to get their ID
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('contact_info', newMemberEmail)
        .single();

      if (userError || !userData) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Add the user as a member
      const { error: memberError } = await supabase
        .from('care_group_members')
        .insert({
          group_id: groupId,
          user_id: userData.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      setNewMemberEmail("");
      await fetchGroupDetails();

    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!group || !groupId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-lg font-semibold truncate">
              {group.name}
            </h1>
            {group.privacy_settings?.status && (
              <MiniStatusIndicator 
                status={group.privacy_settings.status} 
                message={group.privacy_settings.status} 
                groupId={groupId}
                isAdmin={isAdmin}
              />
            )}
          </div>
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Group Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <PatientInfoCard groupId={groupId} patientInfo={patientInfo} />
                  <GroupStatusBar 
                    groupId={groupId} 
                    initialStatus={group.privacy_settings?.status || "normal"} 
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Mini Calendar */}
        <MiniCalendar />

        {/* Tab Navigation */}
        <div className="flex border-t">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'tasks' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Members
          </button>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-40 pb-20">
        {activeTab === 'posts' && (
          <div className="px-0">
            <GroupPosts groupId={groupId} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="px-4">
            <GroupTasks groupId={groupId} members={members} />
          </div>
        )}

        {activeTab === 'info' && (
          <div className="px-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({members.length})
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Member Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="Enter member email"
                          />
                        </div>
                        <Button 
                          onClick={handleAddMember} 
                          className="w-full"
                          disabled={isAddingMember}
                        >
                          {isAddingMember ? "Adding..." : "Add Member"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {member.profiles?.first_name} {member.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
