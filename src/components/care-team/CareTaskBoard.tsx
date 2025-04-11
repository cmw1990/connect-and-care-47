
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, Clock, CalendarCheck, ListChecks, Plus, 
  ClipboardList, Calendar, AlertCircle, MoreHorizontal, X 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CareTask, Task } from '@/types';
import { createMockCareTasks, typeCastObject } from '@/utils/mockDataHelper';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Helper function to convert Task to CareTask
const convertTaskToCareTask = (task: Task): CareTask => {
  return {
    id: task.id,
    title: task.title,
    due_date: task.due_date,
    status: task.status as any,
    priority: task.priority as any,
    team_id: task.group_id,
    category: 'general' // Default category
  };
};

interface CareTaskBoardProps {
  teamId: string;
}

export function CareTaskBoard({ teamId }: CareTaskBoardProps) {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CareTask | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState<string>('all');
  const { toast } = useToast();
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>(new Date());
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low" | "urgent">('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('general');
  
  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      // Create mock data
      const mockTasks = createMockCareTasks(8, { team_id: teamId });
      setTasks(mockTasks);
      setIsLoadingTasks(false);
    }, 1000);
  }, [teamId]);
  
  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskDueDate) {
      toast.error("Please complete all required fields", "Title and due date are required");
      return;
    }
    
    const newTask: CareTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      due_date: newTaskDueDate.toISOString(),
      status: 'pending',
      priority: newTaskPriority,
      created_at: new Date().toISOString(),
      team_id: teamId,
      category: newTaskCategory,
    };
    
    setTasks([...tasks, newTask]);
    
    toast.success("Task added successfully");
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(new Date());
    setNewTaskPriority('medium');
    setNewTaskCategory('general');
    setIsAddingTask(false);
  };
  
  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as any, 
            ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}) 
          } 
        : task
    );
    
    setTasks(updatedTasks);
    
    toast.success(
      `Task moved to ${newStatus.replace('_', ' ')}`,
      `Task "${tasks.find(t => t.id === taskId)?.title}" updated`
    );
  };
  
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    
    if (confirm(`Are you sure you want to delete "${taskToDelete?.title}"?`)) {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      toast.success(
        "Task deleted",
        `"${taskToDelete?.title}" has been deleted`
      );
    }
  };
  
  const getFilteredTasks = (status: string) => {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Care Tasks
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddingTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        <CardDescription>Manage and track team tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setFilteredStatus}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filteredStatus} className="mt-4">
            {isLoadingTasks ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : getFilteredTasks(filteredStatus).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No tasks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No {filteredStatus === 'all' ? '' : filteredStatus} tasks available at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredTasks(filteredStatus).map(task => (
                  <div key={task.id} className="flex items-center bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsViewingTask(true);
                          }}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(task.status)} mr-2`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row text-sm text-gray-500 mt-1">
                        <div className="flex items-center mr-4">
                          <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        
                        {task.category && (
                          <div className="flex items-center mt-1 sm:mt-0">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {task.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center">
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedTask(task);
                              setIsViewingTask(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          
                          {task.status !== 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'pending')}>
                              Mark as Pending
                            </DropdownMenuItem>
                          )}
                          
                          {task.status !== 'in_progress' && (
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                              Mark as In Progress
                            </DropdownMenuItem>
                          )}
                          
                          {task.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          
                          {task.status !== 'cancelled' && (
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')}>
                              Mark as Cancelled
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Add Task Dialog */}
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {newTaskDueDate ? format(newTaskDueDate, 'PP') : 'Select date'}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTaskPriority} 
                    onValueChange={(value: "high" | "medium" | "low" | "urgent") => setNewTaskPriority(value)}
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
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTaskCategory} 
                  onValueChange={setNewTaskCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Task Dialog */}
        <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedTask && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle>{selectedTask.title}</DialogTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setIsViewingTask(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                    {selectedTask.category && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {selectedTask.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="font-medium">{new Date(selectedTask.due_date).toLocaleDateString()}</p>
                    </div>
                    
                    {selectedTask.created_at && (
                      <div>
                        <Label className="text-muted-foreground">Created</Label>
                        <p className="font-medium">{new Date(selectedTask.created_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTask.description && (
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  {selectedTask.completed_at && (
                    <div>
                      <Label className="text-muted-foreground">Completed</Label>
                      <p className="font-medium text-sm">{new Date(selectedTask.completed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setIsViewingTask(false);
                      setSelectedTask(null);
                    }}
                  >
                    Close
                  </Button>
                  
                  {selectedTask.status !== 'completed' && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => {
                        handleUpdateTaskStatus(selectedTask.id, 'completed');
                        setIsViewingTask(false);
                        setSelectedTask(null);
                      }}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
