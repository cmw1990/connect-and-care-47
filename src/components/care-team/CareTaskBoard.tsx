
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Calendar,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';
import { CareTask } from '@/types';
import { createMockTasks } from '@/utils/mockDataHelper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const CareTaskBoard = () => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as const,
    category: 'general',
  });

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // In a real app, we would fetch tasks from Supabase
        // For now, use mock data
        const mockTasks = createMockTasks(8);
        setTasks(mockTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'general'
    });
    setDialogOpen(true);
  };

  const handleEditTask = (task: CareTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: new Date(task.due_date).toISOString().split('T')[0],
      priority: task.priority,
      category: task.category
    });
    setDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.due_date) {
        toast.error("Please fill in all required fields");
        return;
      }

      const newTask: Partial<CareTask> = {
        title: formData.title,
        description: formData.description,
        due_date: new Date(formData.due_date).toISOString(),
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        team_id: 'team-1',
        created_by: 'user-1',
      };

      if (editingTask) {
        // Update task
        const updatedTask = {
          ...editingTask,
          ...newTask
        };

        // In a real app, we would update the task in Supabase
        // For now, update in local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === editingTask.id ? updatedTask as CareTask : task
          )
        );
        toast.success("Task updated successfully");
      } else {
        // Create task
        const createdTask: CareTask = {
          ...newTask,
          id: `task-${Date.now()}`,
          status: 'pending',
          created_at: new Date().toISOString(),
          team_id: 'team-1',
        } as CareTask;

        // In a real app, we would create the task in Supabase
        // For now, add to local state
        setTasks(prevTasks => [...prevTasks, createdTask]);
        toast.success("Task created successfully");
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error("Failed to save task");
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: CareTask['status']) => {
    try {
      // In a real app, we would update the task in Supabase
      // For now, update in local state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { 
              ...task, 
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
              completed_by: newStatus === 'completed' ? 'user-1' : null
            };
            return updatedTask;
          }
          return task;
        })
      );

      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'updated'} successfully`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // In a real app, we would delete the task from Supabase
      // For now, remove from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      case 'urgent':
        return 'text-purple-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  // Group tasks by status
  const tasksByStatus: Record<string, CareTask[]> = {
    pending: [],
    in_progress: [],
    completed: [],
    cancelled: []
  };

  tasks.forEach(task => {
    const status = task.status;
    if (tasksByStatus[status]) {
      tasksByStatus[status].push(task);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Care Tasks</h2>
        <Button onClick={handleAddTask} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Card key={status} className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize flex justify-between items-center">
                <span>{status.replace('_', ' ')}</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                  {statusTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusTasks.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No tasks in this status
                </div>
              ) : (
                statusTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="border p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      {task.recurring && (
                        <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                          Recurring
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Tag className="h-3 w-3 mr-1" />
                      <span className="capitalize">{task.category}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex space-x-1">
                        {status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        
                        {status !== 'in_progress' && status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                            className="h-8 w-8 p-0"
                          >
                            <Clock className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        
                        {status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(task.id, 'cancelled')}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditTask(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-amber-500" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Update the task details below'
                : 'Fill in the task details below to create a new task'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Task title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide additional details"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleSelectChange('priority', value)}
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
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareTaskBoard;
