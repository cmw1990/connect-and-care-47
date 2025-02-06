
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface TaskSchedulerProps {
  groupId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  priority: string;
  group_id: string;
}

export const TaskScheduler = ({ groupId }: TaskSchedulerProps) => {
  const { toast } = useToast();

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure recurrence_pattern is correctly typed
      return data?.map(task => ({
        ...task,
        recurrence_pattern: typeof task.recurrence_pattern === 'string' 
          ? JSON.parse(task.recurrence_pattern)
          : task.recurrence_pattern
      }));
    }
  });

  useEffect(() => {
    // Subscribe to real-time task updates
    const channel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `group_id=eq.${groupId}`
        },
        (payload: { 
          eventType: 'INSERT' | 'UPDATE' | 'DELETE';
          new: Task;
          old: Task | null;
        }) => {
          console.log('Task change received:', payload);
          refetchTasks();
          
          const eventType = payload.eventType;
          const newTask = payload.new;
          
          // Show appropriate notification based on event type
          if (eventType === 'INSERT') {
            toast({
              title: "New Task Added",
              description: `Task "${newTask.title}" has been added.`
            });
          } else if (eventType === 'UPDATE') {
            toast({
              title: "Task Updated",
              description: `Task "${newTask.title}" has been updated.`
            });
          } else if (eventType === 'DELETE') {
            toast({
              title: "Task Deleted",
              description: "A task has been removed."
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, refetchTasks, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Schedule Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskForm groupId={groupId} onTaskCreated={refetchTasks} />
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Upcoming Tasks</h3>
          <TaskList tasks={tasks} onTaskUpdated={refetchTasks} />
        </div>
      </CardContent>
    </Card>
  );
};
