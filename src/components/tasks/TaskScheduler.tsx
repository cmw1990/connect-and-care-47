
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

interface TaskSchedulerProps {
  groupId: string;
}

export const TaskScheduler = ({ groupId }: TaskSchedulerProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
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
      return data as Task[];
    }
  });

  const handleScheduleTask = async () => {
    try {
      if (!title || !date) {
        toast({
          title: "Missing Information",
          description: "Please provide both title and date",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("tasks").insert({
        title,
        due_date: date.toISOString(),
        group_id: groupId,
        status: "pending",
        priority: "normal",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task scheduled successfully",
      });

      setTitle("");
      setDate(undefined);
      refetchTasks();
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast({
        title: "Error",
        description: "Failed to schedule task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });

      refetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Schedule Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <Button 
          onClick={handleScheduleTask}
          className="w-full"
          disabled={!title || !date}
        >
          Schedule Task
        </Button>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Upcoming Tasks</h3>
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                {task.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {task.status !== 'pending' && (
                  <span className={`text-sm ${
                    task.status === 'completed' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {task.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
