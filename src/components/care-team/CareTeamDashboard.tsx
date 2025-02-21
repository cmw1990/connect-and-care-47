import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CareTeamList } from './CareTeamList';
import { CareTaskBoard } from './CareTaskBoard';
import { CareTeamChat } from './CareTeamChat';
import { CareScheduleCalendar } from './CareScheduleCalendar';
import { CareNotesList } from './CareNotesList';
import { useToast } from '@/components/ui/use-toast';
import { careTeamService } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';

export function CareTeamDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTeam, setActiveTeam] = React.useState<string | null>(null);

  const handleTeamSelect = (teamId: string) => {
    setActiveTeam(teamId);
  };

  const handleError = (error: Error) => {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please sign in to access care team features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Care Team List - Left Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Care Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <CareTeamList onTeamSelect={handleTeamSelect} onError={handleError} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-span-9">
          {activeTeam ? (
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks">
                <Card>
                  <CardContent className="p-6">
                    <CareTaskBoard teamId={activeTeam} onError={handleError} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <Card>
                  <CardContent className="p-6">
                    <CareTeamChat teamId={activeTeam} onError={handleError} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardContent className="p-6">
                    <CareScheduleCalendar teamId={activeTeam} onError={handleError} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardContent className="p-6">
                    <CareNotesList teamId={activeTeam} onError={handleError} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Select a care team to view details and collaborate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
