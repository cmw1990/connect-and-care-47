import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  assigned_user: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface GroupTasksProps {
  groupId: string;
  members: {
    user_id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }[];
}

export const GroupTasks = ({ groupId, members }: GroupTasksProps) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [newTask, setNewTask] = React.useState({
    title: "",
    priority: "medium",
    assigned_to: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          status,
          priority,
          assigned_to,
          assigned_user:profiles!tasks_assigned_to_fkey (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from("tasks").insert({
        title: newTask.title.trim(),
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || null,
        group_id: groupId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setNewTask({ title: "", priority: "medium", assigned_to: "" });
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editingTask.title,
          priority: editingTask.priority,
          assigned_to: editingTask.assigned_to,
        })
        .eq("id", editingTask.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, [groupId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={editingTask ? editingTask.title : newTask.title}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, title: e.target.value })
                        : setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editingTask ? editingTask.priority : newTask.priority}
                    onValueChange={(value) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, priority: value })
                        : setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned">Assign To</Label>
                  <Select
                    value={
                      editingTask ? editingTask.assigned_to : newTask.assigned_to
                    }
                    onValueChange={(value) =>
                      editingTask
                        ? setEditingTask({ ...editingTask, assigned_to: value })
                        : setNewTask({ ...newTask, assigned_to: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.profiles?.first_name} {member.profiles?.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? editingTask
                      ? "Updating..."
                      : "Creating..."
                    : editingTask
                    ? "Update Task"
                    : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleTask(task.id, task.status)}
                >
                  <CheckSquare
                    className={`h-5 w-5 ${
                      task.status === "completed"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <div>
                  <p
                    className={`font-medium ${
                      task.status === "completed" ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.assigned_user && (
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {task.assigned_user.first_name}{" "}
                      {task.assigned_user.last_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                          id="title"
                          value={editingTask?.title}
                          onChange={(e) =>
                            setEditingTask(
                              editingTask
                                ? { ...editingTask, title: e.target.value }
                                : null
                            )
                          }
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={editingTask?.priority}
                          onValueChange={(value) =>
                            setEditingTask(
                              editingTask
                                ? { ...editingTask, priority: value }
                                : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assigned">Assign To</Label>
                        <Select
                          value={editingTask?.assigned_to || ""}
                          onValueChange={(value) =>
                            setEditingTask(
                              editingTask
                                ? { ...editingTask, assigned_to: value }
                                : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem
                                key={member.user_id}
                                value={member.user_id}
                              >
                                {member.profiles?.first_name}{" "}
                                {member.profiles?.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleUpdateTask}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating..." : "Update Task"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};