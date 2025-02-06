
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      return data?.map(task => ({
        ...task,
        recurrence_pattern: typeof task.recurrence_pattern === 'string' 
          ? JSON.parse(task.recurrence_pattern)
          : task.recurrence_pattern
      }));
    }
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(t => t.status === "completed").length || 0,
    pending: tasks?.filter(t => t.status === "pending").length || 0,
    highPriority: tasks?.filter(t => t.priority === "high").length || 0
  };

  useEffect(() => {
    // Subscribe to real-time task updates using the new Supabase syntax
    const channel = supabase.channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          console.log('Task change received:', payload);
          refetchTasks();
          
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          const newTask = payload.new as Task;
          
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, refetchTasks, toast]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Schedule Task
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.highPriority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskForm groupId={groupId} onTaskCreated={refetchTasks} />
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Upcoming Tasks</h3>
          <TaskList tasks={filteredTasks} onTaskUpdated={refetchTasks} />
        </div>
      </CardContent>
    </Card>
  );
};
