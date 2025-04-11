
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/integrations/supabaseClient";
import { transformTaskData } from "@/utils/supabaseHelpers";
import { Task } from "@/types/database.types";

interface GroupTasksProps {
  groupId: string;
}

export const GroupTasks = ({ groupId }: GroupTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: ""
  });
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("care_group_members")
          .select(`
            user_id,
            profiles:user_id (
              id,
              first_name,
              last_name
            )
          `)
          .eq("group_id", groupId);
        
        if (error) throw error;
        
        const users = data?.map(member => {
          let firstName = '';
          let lastName = '';
          
          if (member.profiles && typeof member.profiles === 'object') {
            firstName = (member.profiles as any).first_name || '';
            lastName = (member.profiles as any).last_name || '';
          }
          
          return {
            id: member.user_id,
            name: `${firstName} ${lastName}`.trim() || 'Unknown User'
          };
        }) || [];
        
        setAvailableUsers(users);
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };
    
    fetchGroupMembers();
  }, [groupId]);
  
  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("tasks")
        .select(`
          id,
          title,
          description,
          status,
          priority,
          assigned_to,
          due_date,
          created_at,
          assigned_user:profiles!fk_assigned_to (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Task interface
      if (data) {
        const processedData = data.map(task => ({
          ...task,
          assigned_user: task.assigned_user || {
            first_name: 'Unassigned',
            last_name: ''
          }
        }));
        const transformedTasks = transformTaskData(processedData);
        setTasks(transformedTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [groupId]);
  
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.from("tasks").insert({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        status: "pending",
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || null,
        due_date: newTask.due_date || null,
        group_id: groupId
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setNewTask({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "" });
      setIsDialogOpen(false);
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
    if (!editingTask || !editingTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabaseClient
        .from("tasks")
        .update({
          title: editingTask.title.trim(),
          description: (editingTask as any).description?.trim() || null,
          priority: editingTask.priority,
          assigned_to: (editingTask as any).assigned_to || null,
          due_date: (editingTask as any).due_date || null,
          status: editingTask.status
        })
        .eq("id", editingTask.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      setEditingTask(null);
      setIsDialogOpen(false);
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
      const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
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
  
  const handleMarkAsComplete = async (taskId: string) => {
    try {
      const { error } = await supabaseClient
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task marked as completed",
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <Button onClick={() => {
          setEditingTask(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No tasks yet. Click "New Task" to create one.
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                {task.status === "completed" ? (
                  <div className="hidden md:block md:col-span-1">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                ) : (
                  <div className="hidden md:block md:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkAsComplete(task.id)}
                      className="h-8 w-8"
                    >
                      <CheckCircle className="h-5 w-5 text-gray-400 hover:text-green-500" />
                    </Button>
                  </div>
                )}
                <div className="md:col-span-9">
                  <h3 className={`font-medium text-lg ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                    {task.assigned_user && (
                      <Badge variant="outline">
                        Assigned to: {task.assigned_user.first_name} {task.assigned_user.last_name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 md:col-span-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingTask(task);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) => 
                    editingTask 
                      ? setEditingTask({ ...editingTask, title: e.target.value }) 
                      : setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingTask ? (editingTask as any).description || '' : newTask.description}
                  onChange={(e) => 
                    editingTask 
                      ? setEditingTask({ ...editingTask, description: e.target.value } as any) 
                      : setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
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
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingTask && (
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editingTask.status}
                      onValueChange={(value) => 
                        setEditingTask({ ...editingTask, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Select
                    value={editingTask ? (editingTask as any).assigned_to || '' : newTask.assigned_to}
                    onValueChange={(value) => 
                      editingTask 
                        ? setEditingTask({ ...editingTask, assigned_to: value } as any) 
                        : setNewTask({ ...newTask, assigned_to: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={editingTask ? (editingTask as any).due_date || '' : newTask.due_date}
                    onChange={(e) => 
                      editingTask 
                        ? setEditingTask({ ...editingTask, due_date: e.target.value } as any) 
                        : setNewTask({ ...newTask, due_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingTask ? handleUpdateTask : handleCreateTask}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : (editingTask ? "Update Task" : "Create Task")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
