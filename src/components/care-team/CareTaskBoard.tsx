import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { careTeamService } from '@/lib/supabase/care-team-service';
import type { CareTask } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
});

interface CareTaskBoardProps {
  teamId: string;
  onError: (error: Error) => void;
}

const taskStatusColumns = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export function CareTaskBoard({ teamId, onError }: CareTaskBoardProps) {
  const { user } = useUser();
  const [tasks, setTasks] = React.useState<CareTask[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
      dueDate: '',
    },
  });

  const loadTasks = React.useCallback(async () => {
    try {
      const tasks = await careTeamService.getCareTasks(teamId);
      setTasks(tasks);
    } catch (error) {
      onError(error as Error);
    }
  }, [teamId, onError]);

  React.useEffect(() => {
    loadTasks();
    
    const subscription = careTeamService.subscribeToTasks(teamId, (payload) => {
      loadTasks();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [teamId, loadTasks]);

  const handleCreateTask = async (data: z.infer<typeof createTaskSchema>) => {
    try {
      if (user) {
        await careTeamService.createCareTask({
          teamId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: 'pending',
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          createdBy: user.id,
          recurring: false,
        });
        await loadTasks();
        setIsCreateDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await careTeamService.updateCareTask(taskId, {
        status: newStatus,
      });
      await loadTasks();
    } catch (error) {
      onError(error as Error);
    }
  };

  const getTasksByStatus = (status: keyof typeof taskStatusColumns) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter task title" />
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
                      <Textarea {...field} placeholder="Enter task description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(taskStatusColumns).map(([status, title]) => (
            <div key={status} className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-4">{title}</h4>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {getTasksByStatus(status as keyof typeof taskStatusColumns).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-card p-3 rounded-md shadow-sm"
                          >
                            <h5 className="font-medium">{task.title}</h5>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
