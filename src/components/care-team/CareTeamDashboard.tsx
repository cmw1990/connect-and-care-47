import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";
import { CareTeamMembers } from './CareTeamMembers';
import { CareTaskBoard } from './CareTaskBoard';
import { CareTeamChat } from './CareTeamChat';
import { CareScheduleCalendar } from './CareScheduleCalendar';
import { CareNotesList } from './CareNotesList';
import useUser from '@/lib/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';

interface RouteParams {
  teamId: string;
}

export const CareTeamDashboard: React.FC = () => {
  const { teamId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!teamId) {
      console.error("Team ID is missing");
      return;
    }

    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('care_teams')
          .select('*')
          .eq('id', teamId)
          .single();

        if (error) {
          console.error("Error fetching team:", error);
        } else {
          setTeam(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Team Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The care team you're looking for does not exist.
        </p>
        <Button onClick={() => navigate('/groups')}>
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Care Team: {team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultvalue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <CareTaskBoard teamId={teamId} />
          </TabsContent>
          <TabsContent value="members">
            <CareTeamMembers teamId={teamId} />
          </TabsContent>
          <TabsContent value="chat">
            <CareTeamChat teamId={teamId} />
          </TabsContent>
          <TabsContent value="schedule">
            <CareScheduleCalendar teamId={teamId} />
          </TabsContent>
          <TabsContent value="notes">
            <CareNotesList teamId={teamId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
