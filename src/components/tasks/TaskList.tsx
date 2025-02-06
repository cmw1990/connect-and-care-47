
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
}

interface TaskListProps {
  tasks: Task[] | undefined;
  onTaskUpdated: () => void;
}

export const TaskList = ({ tasks, onTaskUpdated }: TaskListProps) => {
  const { toast } = useToast();

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

      onTaskUpdated();
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
  );
};
