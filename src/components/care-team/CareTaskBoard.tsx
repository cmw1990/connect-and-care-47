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
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
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

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'inProgress' | 'completed';
  dueDate: Date;
  recurring: boolean;
}

const CareTaskBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>(new Date());
  const { user } = useUser();

  useEffect(() => {
    if (teamId) {
      loadTasks();
    }
  }, [teamId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
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

  const addTask = async (task: Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('care_tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<CareTask>) => {
    try {
      const { data, error } = await supabase
        .from('care_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('care_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      teamId: teamId,
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      status: 'pending',
      category: 'general', // Add the missing category field
      dueDate: newTaskDueDate,
      createdBy: user?.id || 'unknown',
      recurring: false
    };

    addTask(newTask)
      .then(() => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskDueDate(new Date());
        setShowAddTaskDialog(false);
        loadTasks();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to add task: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleUpdateTaskStatus = (taskId: string, status: CareTask['status']) => {
    updateTask(taskId, { status })
      .then(() => {
        loadTasks();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to update task status: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
      .then(() => {
        loadTasks();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Care Tasks</h3>
        <Button onClick={() => setShowAddTaskDialog(true)}>Add Task</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Pending</h4>
            {tasks
              .filter((task) => task.status === 'pending')
              .map((task) => (
                <Card key={task.id} className="mb-2">
                  <CardContent className="p-3">
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
                  </CardContent>
                </Card>
              ))}
          </div>

          <div>
            <h4 className="font-semibold mb-2">In Progress</h4>
            {tasks
              .filter((task) => task.status === 'inProgress')
              .map((task) => (
                <Card key={task.id} className="mb-2">
                  <CardContent className="p-3">
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
                  </CardContent>
                </Card>
              ))}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Completed</h4>
            {tasks
              .filter((task) => task.status === 'completed')
              .map((task) => (
                <Card key={task.id} className="mb-2">
                  <CardContent className="p-3">
                    <h5 className="font-medium">{task.title}</h5>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="flex justify-end items-center mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for the care team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                id="priority"
                value={newTaskPriority}
                onValueChange={(value) => setNewTaskPriority(value as 'high' | 'medium' | 'low')}
                className="col-span-3"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !newTaskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recurring" className="text-right">
                Recurring
              </Label>
              <Checkbox
                id="recurring"
                disabled
              />
            </div>
          </div>
          <Button onClick={handleAddTask}>Add Task</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { CareTaskBoard };
