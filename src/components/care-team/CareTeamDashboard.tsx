
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import CareTaskBoard from './CareTaskBoard';
import { CareTeamChat } from '../care-team/CareTeamChat';

interface RouteParams {
  id: string;
}

const CareTeamDashboard = () => {
  const { id } = useParams<RouteParams>();
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    setIsLoading(true);
    try {
      // Mock data for development until care_teams is fully implemented
      const mockTeamDetails = {
        id,
        name: "Smith Family Care Team",
        description: "Primary care team for John Smith",
        created_by: "caregiver-123",
        primary_caregiver: "caregiver-123",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members: [
          { id: "member-1", user_id: "caregiver-123", role: "primary", status: "active" },
          { id: "member-2", user_id: "family-456", role: "family", status: "active" },
          { id: "member-3", user_id: "professional-789", role: "professional", status: "active" }
        ]
      };
      
      setTeamDetails(mockTeamDetails);
    } catch (error: any) {
      console.error('Error fetching team:', error);
      toast({
        title: "Error",
        description: "Failed to load team details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: Error) => {
    console.error('Component error:', error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold">Team not found</h3>
        <p className="text-muted-foreground">The requested care team does not exist or you don't have access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{teamDetails.name}</h1>
          <p className="text-muted-foreground">{teamDetails.description}</p>
        </div>
        <Button>Team Settings</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">Members</h3>
              <p className="text-3xl font-bold">{teamDetails.members?.length || 0}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">Status</h3>
              <p className="text-3xl font-bold capitalize">{teamDetails.status}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium">Created</h3>
              <p className="text-3xl font-bold">
                {new Date(teamDetails.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="chat">Team Chat</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="py-4">
          <CareTaskBoard />
        </TabsContent>

        <TabsContent value="chat" className="py-4">
          <div className="h-[600px]">
            <CareTeamChat 
              teamId={id} 
              onError={handleError}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="py-4">
          <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-xl text-muted-foreground">Schedule functionality coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="py-4">
          <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-xl text-muted-foreground">Notes functionality coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareTeamDashboard;
