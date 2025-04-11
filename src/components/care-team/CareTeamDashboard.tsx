
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CareMetrics } from '@/components/analytics/CareMetrics';
import { CareTaskBoard } from '@/components/care-team/CareTaskBoard';
import { CareTeamChat } from '@/components/care-team/CareTeamChat';
import { DirectMessageChat } from '@/components/chat/DirectMessageChat';
import { createMockUserProfile } from '@/utils/mockDataHelper';

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const CareTeamDashboard = ({ teamId }: { teamId: string }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('Care Team');
  
  useEffect(() => {
    fetchTeamData();
  }, [teamId]);
  
  const fetchTeamData = async () => {
    try {
      // Mock data loading
      setTimeout(() => {
        const mockMembers = [
          {
            id: 'member1',
            role: 'caregiver',
            user: createMockUserProfile({ first_name: 'John', last_name: 'Smith' })
          },
          {
            id: 'member2',
            role: 'nurse',
            user: createMockUserProfile({ first_name: 'Mary', last_name: 'Johnson' })
          },
          {
            id: 'member3',
            role: 'doctor',
            user: createMockUserProfile({ first_name: 'Robert', last_name: 'Williams' })
          },
          {
            id: 'member4',
            role: 'family',
            user: createMockUserProfile({ first_name: 'Sarah', last_name: 'Brown' })
          },
        ];
        
        setTeamMembers(mockMembers);
        setTeamName('Johnson Family Care Team');
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setLoading(false);
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'caregiver':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'doctor':
        return 'bg-purple-100 text-purple-800';
      case 'family':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{teamName}</CardTitle>
          <CardDescription>Team members, tasks, and communication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-muted cursor-pointer"
                onClick={() => setSelectedMember(member.id)}
              >
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                  {member.user.first_name[0]}{member.user.last_name[0]}
                </div>
                <div>
                  <div className="font-medium">{member.user.first_name} {member.user.last_name}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(member.role)}`}>
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Add Member</span>
              <span className="text-lg">+</span>
            </Button>
          </div>
          
          <Tabs defaultValue="tasks">
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="chat">Team Chat</TabsTrigger>
              <TabsTrigger value="direct">Direct Messages</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks">
              <CareTaskBoard teamId={teamId} />
            </TabsContent>
            
            <TabsContent value="chat">
              <div className="h-[500px]">
                <CareTeamChat teamId={teamId} onError={(error) => console.error(error)} />
              </div>
            </TabsContent>
            
            <TabsContent value="direct">
              {selectedMember ? (
                <div className="h-[500px]">
                  <DirectMessageChat 
                    recipientId={selectedMember} 
                    onSendMessage={(message) => console.log('Message sent:', message)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="text-muted-foreground mb-2">Select a team member to start a conversation</div>
                  <div className="text-sm text-muted-foreground max-w-md">
                    Click on any of the team members above to start a direct message conversation with them.
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="metrics">
              <CareMetrics groupId={teamId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
