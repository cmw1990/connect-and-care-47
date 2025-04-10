
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CareTask } from '@/types/tasks';
import useUser from '@/lib/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";

interface TaskFormData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  recurring: boolean;
}

const CareTaskBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date(),
    recurring: false
  });
  const { user } = useUser();

  useEffect(() => {
    if (teamId) {
      loadTasks();
    }
  }, [teamId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Mock tasks for development until care_tasks is fully implemented
      const mockTasks: CareTask[] = [
        {
          id: '1',
          team_id: teamId || '',
          title: 'Morning medication',
          description: 'Administer morning medications',
          category: 'medication',
          priority: 'high',
          status: 'pending',
          created_by: user?.id || 'unknown',
          recurring: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          team_id: teamId || '',
          title: 'Physical therapy',
          description: 'Complete daily physical therapy routine',
          category: 'exercise',
          priority: 'medium',
          status: 'inProgress',
          created_by: user?.id || 'unknown',
          recurring: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          team_id: teamId || '',
          title: 'Doctor appointment',
          description: 'Quarterly checkup with Dr. Smith',
          category: 'appointment',
          priority: 'high',
          status: 'completed',
          created_by: user?.id || 'unknown',
          recurring: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setTasks(mockTasks);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load tasks: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!formData.title.trim()) return;

    const newTask: CareTask = {
      id: `temp-${Date.now()}`,
      team_id: teamId || '',
      title: formData.title,
      description: formData.description,
      category: 'general',
      priority: formData.priority,
      status: 'pending',
      due_date: formData.dueDate,
      created_by: user?.id || 'unknown',
      recurring: formData.recurring,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to local state for immediate UI update
    setTasks(prev => [...prev, newTask]);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date(),
      recurring: false
    });
    
    setShowAddTaskDialog(false);
    
    toast({
      title: "Success",
      description: "Task added successfully",
    });
  };

  const handleUpdateTaskStatus = (taskId: string, status: CareTask['status']) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status, updated_at: new Date().toISOString() } 
          : task
      )
    );
    
    toast({
      title: "Success",
      description: "Task status updated",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Care Tasks</h3>
        <Button onClick={() => setShowAddTaskDialog(true)}>Add Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Pending</h4>
          {tasks
            .filter((task) => task.status === 'pending')
            .map((task) => (
              <Card key={task.id} className="mb-2 p-3">
                <h5 className="font-medium">{task.title}</h5>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTaskStatus(task.id, 'inProgress')}
                  >
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        <div>
          <h4 className="font-semibold mb-2">In Progress</h4>
          {tasks
            .filter((task) => task.status === 'inProgress')
            .map((task) => (
              <Card key={task.id} className="mb-2 p-3">
                <h5 className="font-medium">{task.title}</h5>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Completed</h4>
          {tasks
            .filter((task) => task.status === 'completed')
            .map((task) => (
              <Card key={task.id} className="mb-2 p-3">
                <h5 className="font-medium">{task.title}</h5>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="flex justify-end items-center mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for the care team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, priority: value }))}
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, recurring: checked === true }))
                }
              />
              <Label htmlFor="recurring">Recurring Task</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddTaskDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareTaskBoard;
