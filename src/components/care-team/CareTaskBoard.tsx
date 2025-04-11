
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { castQueryResult } from "@/utils/supabaseHelpers";

// Define types
export interface CareTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: Date | null;
  completion_notes?: string;
  completed_at?: Date | null;
  completed_by?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

// Mock data for development
const mockTasks: CareTask[] = [
  {
    id: "1",
    team_id: "team-1",
    title: "Medication Check",
    description: "Verify morning medications have been taken",
    category: "medication",
    priority: "high",
    status: "pending",
    assigned_to: "user-1",
    due_date: new Date(),
    created_by: "user-2",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    team_id: "team-1",
    title: "Physical Therapy",
    description: "Complete daily exercises",
    category: "therapy",
    priority: "medium",
    status: "in_progress",
    assigned_to: "user-3",
    due_date: new Date(),
    created_by: "user-2",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    team_id: "team-1",
    title: "Doctor Appointment",
    description: "Schedule follow-up visit with Dr. Smith",
    category: "appointment",
    priority: "low",
    status: "completed",
    completed_at: new Date(),
    completed_by: "user-1",
    due_date: new Date(),
    created_by: "user-3",
    created_at: new Date().toISOString(),
  }
];

const CareTaskBoard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState<Partial<CareTask>>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    status: 'pending',
  });
  const [editTask, setEditTask] = useState<CareTask | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Load tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // In a real implementation, this would be a database call
      // Simulating API delay
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const task: CareTask = {
      id: `task-${Date.now()}`,
      team_id: "team-1", // Hardcoded for this example
      title: newTask.title,
      description: newTask.description,
      category: newTask.category || 'general',
      priority: newTask.priority as CareTask['priority'] || 'medium',
      status: 'pending',
      created_by: "user-1", // Hardcoded for this example
      created_at: new Date().toISOString(),
      due_date: newTask.due_date ? new Date(newTask.due_date) : null,
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      status: 'pending',
    });

    toast({
      title: "Success",
      description: "Task created successfully",
    });
  };

  const handleUpdateTask = () => {
    if (!editTask) return;

    const updatedTasks = tasks.map(task => 
      task.id === editTask.id ? editTask : task
    );

    setTasks(updatedTasks);
    setEditTask(null);
    setEditMode(false);

    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);

    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  };

  const handleStatusChange = (id: string, status: CareTask['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, status };
        if (status === 'completed') {
          updatedTask.completed_at = new Date();
          updatedTask.completed_by = 'user-1';
        } else {
          updatedTask.completed_at = undefined;
          updatedTask.completed_by = undefined;
        }
        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    
    toast({
      title: "Success",
      description: `Task marked as ${status}`,
    });
  };

  // Group tasks by status
  const tasksByStatus: { [key: string]: CareTask[] } = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    cancelled: tasks.filter(t => t.status === 'cancelled'),
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-blue-500 hover:bg-blue-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Care Tasks</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for the care team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description" 
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({...newTask, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({...newTask, priority: value as CareTask["priority"]})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input 
                  type="datetime-local" 
                  value={newTask.due_date ? new Date(newTask.due_date).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value ? new Date(e.target.value) : undefined})}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Board */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="pending">Pending ({tasksByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({tasksByStatus.in_progress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tasksByStatus.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({tasksByStatus.cancelled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {tasksByStatus.pending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending tasks
            </div>
          ) : (
            <div className="grid gap-4">
              {tasksByStatus.pending.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.due_date && (
                          <div className="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(task.due_date).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          size="sm" 
                          variant="outline"
                        >
                          Start
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            {/* Edit Task Dialog Content */}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          onClick={() => handleDeleteTask(task.id)}
                          size="sm" 
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="mt-4">
          {tasksByStatus.in_progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks in progress
            </div>
          ) : (
            <div className="grid gap-4">
              {tasksByStatus.in_progress.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.due_date && (
                          <div className="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(task.due_date).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          size="sm" 
                          variant="outline"
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {tasksByStatus.completed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed tasks
            </div>
          ) : (
            <div className="grid gap-4">
              {tasksByStatus.completed.map((task) => (
                <Card key={task.id} className="overflow-hidden bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.completed_at && (
                          <div className="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Completed: {new Date(task.completed_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          {tasksByStatus.cancelled.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cancelled tasks
            </div>
          ) : (
            <div className="grid gap-4">
              {tasksByStatus.cancelled.map((task) => (
                <Card key={task.id} className="overflow-hidden bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium line-through text-muted-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareTaskBoard;
