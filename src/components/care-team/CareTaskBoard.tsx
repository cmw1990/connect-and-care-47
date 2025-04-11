
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import { CareTask } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createMockCareTasks, typeCastObject } from '@/utils/mockDataHelper';

export const CareTaskBoard = ({ teamId }: { teamId: string }) => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState<Partial<CareTask>>({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    priority: 'medium',
    category: 'general',
    team_id: teamId,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [teamId]);

  const fetchTasks = async () => {
    try {
      // Mock data instead of real API call
      setTimeout(() => {
        setTasks(createMockCareTasks(10));
        setLoading(false);
      }, 500);
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

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.due_date) {
      toast({
        title: "Missing details",
        description: "Please provide a title and due date for the task",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, this would be a Supabase insert
      // Mock implementation
      const mockTask: CareTask = {
        id: `task-${Date.now()}`,
        title: newTask.title!,
        description: newTask.description || '',
        due_date: newTask.due_date!,
        status: newTask.status as CareTask['status'],
        priority: newTask.priority as CareTask['priority'],
        category: newTask.category || 'general',
        team_id: teamId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setTasks([...tasks, mockTask]);

      setNewTask({
        title: '',
        description: '',
        due_date: '',
        status: 'pending',
        priority: 'medium',
        category: 'general',
        team_id: teamId,
      });

      toast({
        title: "Task added",
        description: "The task has been added successfully",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: CareTask['status']) => {
    try {
      // In a real app, this would update the DB record
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status, updated_at: new Date().toISOString() };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      toast({
        title: "Task updated",
        description: `Task status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  // Group tasks by status
  const groupTasksByStatus = () => {
    const grouped: { [key: string]: CareTask[] } = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  };

  const getStatusIcon = (status: CareTask['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <PauseCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: CareTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      case 'urgent':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const TaskCard = ({ task }: { task: CareTask }) => (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs bg-muted px-2 py-1 rounded-full">{task.category}</div>
              <div className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
              <Clock className="h-3 w-3 ml-2" />
              {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
          
          <div className="flex space-x-1">
            {task.status !== 'completed' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            )}
            {task.status !== 'cancelled' && task.status !== 'completed' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')}
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const groupedTasks = groupTasksByStatus();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Tasks</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={newTask.due_date || ''}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newTask.category || 'general'} 
                    onValueChange={(value) => setNewTask({...newTask, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTask.priority || 'medium'} 
                    onValueChange={(value: CareTask['priority']) => setNewTask({...newTask, priority: value})}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Priority" />
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
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Pending</span>
              <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                {groupedTasks.pending?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-blue-500" />
              <span>In Progress</span>
              <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                {groupedTasks.in_progress?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Completed</span>
              <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                {groupedTasks.completed?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Cancelled</span>
              <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                {groupedTasks.cancelled?.length || 0}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {groupedTasks.pending?.length > 0 ? (
              groupedTasks.pending.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">No pending tasks</div>
            )}
          </TabsContent>
          
          <TabsContent value="in_progress" className="space-y-4">
            {groupedTasks.in_progress?.length > 0 ? (
              groupedTasks.in_progress.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">No in-progress tasks</div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {groupedTasks.completed?.length > 0 ? (
              groupedTasks.completed.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">No completed tasks</div>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {groupedTasks.cancelled?.length > 0 ? (
              groupedTasks.cancelled.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">No cancelled tasks</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
