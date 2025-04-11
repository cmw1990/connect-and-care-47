
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, Clock, X, MoreHorizontal, Calendar } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { createMockTask, createMockCareTasks } from '@/utils/mockDataHelper';
import { CareTask } from '@/types';

interface CareTaskBoardProps {
  teamId: string;
}

export function CareTaskBoard({ teamId }: CareTaskBoardProps) {
  const [tasks, setTasks] = useState<CareTask[]>(
    createMockCareTasks(5, { team_id: teamId })
  );
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'medication'
  });
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateTask = () => {
    try {
      const task = createMockTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        status: 'pending',
        team_id: teamId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }) as CareTask;
      
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'medication'
      });
      setIsAddDialogOpen(false);
      
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    try {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      );
      
      setTasks(updatedTasks);
      setEditingTask(null);
      setIsEditDialogOpen(false);
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = (taskId: string, newStatus: CareTask['status']) => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { 
            ...task, 
            status: newStatus,
            updated_at: new Date().toISOString() 
          };
          
          if (newStatus === 'completed') {
            updatedTask.completed_at = new Date().toISOString();
            updatedTask.completed_by = 'current-user';
          } else {
            updatedTask.completed_at = null;
            updatedTask.completed_by = null;
          }
          
          return updatedTask;
        }
        return task;
      });
      
      setTasks(updatedTasks);
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    try {
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task removed successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getStatusColumn = (status: CareTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const renderTask = (task: CareTask) => (
    <Card key={task.id} className="mb-3">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{task.title}</h4>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => {
                setEditingTask(task);
                setIsEditDialogOpen(true);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          <div className={`text-xs px-2 py-1 rounded-full 
            ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'}`}
          >
            {task.priority}
          </div>
          
          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {task.category}
          </div>
          
          <div className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          {task.status !== 'pending' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange(task.id, 'pending')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Button>
          )}
          
          {task.status !== 'in_progress' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange(task.id, 'in_progress')}
            >
              <Clock className="h-4 w-4 mr-1" />
              In Progress
            </Button>
          )}
          
          {task.status !== 'completed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange(task.id, 'completed')}
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={() => handleDeleteTask(task.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Care Tasks</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask({...newTask, priority: value as 'high' | 'medium' | 'low' | 'urgent'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTask.category} 
                  onValueChange={(value) => setNewTask({...newTask, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending
          </h3>
          <div>
            {getStatusColumn('pending').map(renderTask)}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            In Progress
          </h3>
          <div>
            {getStatusColumn('in_progress').map(renderTask)}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Completed
          </h3>
          <div>
            {getStatusColumn('completed').map(renderTask)}
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={editingTask.title} 
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editingTask.description || ''} 
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editingTask.priority} 
                  onValueChange={(value) => setEditingTask({...editingTask, priority: value as 'high' | 'medium' | 'low' | 'urgent'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingTask.category} 
                  onValueChange={(value) => setEditingTask({...editingTask, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask}>
                  Update Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
