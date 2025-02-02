import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navigation/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Settings } from "lucide-react";
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
  const { toast } = useToast();
  const [group, setGroup] = useState<CareGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

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

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!group || !groupId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <GroupStatusBar 
            groupId={groupId} 
            initialStatus={group.privacy_settings?.status || "normal"} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Group Info, Patient Info, and Members */}
            <div className="space-y-6">
              {/* Group Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Patient Info */}
              <PatientInfoCard groupId={groupId} patientInfo={patientInfo} />

              {/* Members Section */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Members ({members.length})
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Member
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
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.profiles?.first_name} {member.profiles?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Section */}
              <GroupCalendar groupId={groupId} />
            </div>

            {/* Right Column - AI Care Assistant, Posts and Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Care Assistant */}
              <CareAssistant groupId={groupId} />
              
              {/* Existing Components */}
              <GroupPosts groupId={groupId} />
              <GroupTasks groupId={groupId} members={members} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetails;
