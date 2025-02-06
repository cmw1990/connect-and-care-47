
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";

interface TaskSchedulerProps {
  groupId: string;
}

export const TaskScheduler = ({ groupId }: TaskSchedulerProps) => {
  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

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
