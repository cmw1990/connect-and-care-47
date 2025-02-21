import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { careTeamService } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';
import type { CareTeam } from '@/lib/supabase/care-team-service';

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
});

interface CareTeamListProps {
  onTeamSelect: (teamId: string) => void;
  onError: (error: Error) => void;
}

export function CareTeamList({ onTeamSelect, onError }: CareTeamListProps) {
  const { user } = useUser();
  const [teams, setTeams] = React.useState<CareTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const loadTeams = React.useCallback(async () => {
    try {
      if (user) {
        const teams = await careTeamService.getCareTeams(user.id);
        setTeams(teams);
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [user, onError]);

  React.useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    onTeamSelect(teamId);
  };

  const handleCreateTeam = async (data: z.infer<typeof createTeamSchema>) => {
    try {
      if (user) {
        await careTeamService.createCareTeam({
          name: data.name,
          description: data.description,
          createdBy: user.id,
          status: 'active',
        });
        await loadTeams();
        setIsCreateDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Care Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter team name" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter team description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Team</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-2">
          {teams.map((team) => (
            <Button
              key={team.id}
              variant={selectedTeam === team.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleTeamSelect(team.id)}
            >
              {team.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
