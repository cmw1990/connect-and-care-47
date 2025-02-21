import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { careTeamService } from '@/lib/supabase/care-team-service';
import type { CareNote } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';
import { Badge } from '@/components/ui/badge';

const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  category: z.string().min(1, 'Category is required'),
  visibility: z.enum(['team', 'medical', 'private']),
  tags: z.string().optional(),
});

interface CareNotesListProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareNotesList({ teamId, onError }: CareNotesListProps) {
  const { user } = useUser();
  const [notes, setNotes] = React.useState<CareNote[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      content: '',
      category: '',
      visibility: 'team' as const,
      tags: '',
    },
  });

  const loadNotes = React.useCallback(async () => {
    try {
      const notes = await careTeamService.getCareNotes(teamId);
      setNotes(notes);
    } catch (error) {
      onError(error as Error);
    }
  }, [teamId, onError]);

  React.useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async (data: z.infer<typeof createNoteSchema>) => {
    try {
      if (user) {
        await careTeamService.createCareNote({
          teamId,
          authorId: user.id,
          content: data.content,
          category: data.category,
          visibility: data.visibility,
          tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : undefined,
        });
        await loadNotes();
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
        <h3 className="text-lg font-semibold">Notes</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateNote)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter note content" className="h-32" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="care">Care</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="medical">Medical Staff Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter tags (comma-separated)" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Note</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-card p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-medium">{note.category}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <Badge
                variant={
                  note.visibility === 'private'
                    ? 'destructive'
                    : note.visibility === 'medical'
                    ? 'default'
                    : 'secondary'
                }
              >
                {note.visibility}
              </Badge>
            </div>
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
