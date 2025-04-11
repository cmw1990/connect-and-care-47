
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus, Check, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/lib/hooks/use-user';

// Define task type
interface CareTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date: Date | string;
  completion_notes?: string;
  completed_at?: Date | string;
  completed_by?: string;
  recurring?: boolean;
  recurrence_pattern?: Record<string, any>;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

interface CareTaskBoardProps {
  teamId: string;
}

export const CareTaskBoard: React.FC<CareTaskBoardProps> = ({ teamId }) => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [newTask, setNewTask] = useState<Partial<CareTask>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0],
  });
  
  const [editTask, setEditTask] = useState<CareTask | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Mock data instead of real database call
        const mockTasks: CareTask[] = [
          {
            id: '1',
            team_id: teamId,
            title: 'Morning medication check',
            description: 'Ensure morning medications have been taken',
            category: 'medication',
            priority: 'high',
            status: 'pending',
            assigned_to: user?.id,
            due_date: new Date(new Date().setHours(9, 0, 0)),
            created_by: user?.id || 'user-1',
          },
          {
            id: '2',
            team_id: teamId,
            title: 'Weekly doctor visit',
            description: 'Accompany to regular doctor checkup',
            category: 'appointment',
            priority: 'medium',
            status: 'in_progress',
            assigned_to: user?.id,
            due_date: new Date(new Date().setDate(new Date().getDate() + 2)),
            created_by: user?.id || 'user-1',
          },
          {
            id: '3',
            team_id: teamId,
            title: 'Daily walk',
            description: 'Take a 15-minute walk outdoors',
            category: 'exercise',
            priority: 'low',
            status: 'completed',
            assigned_to: user?.id,
            due_date: new Date(),
            completed_at: new Date(),
            completed_by: user?.id,
            created_by: user?.id || 'user-1',
          }
        ];
        
        setTasks(mockTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: 'Failed to load tasks',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchTasks();
  }, [teamId, user]);

  const handleCreateTask = async () => {
    if (!user) return;

    try {
      const taskToCreate = {
        ...newTask,
        team_id: teamId,
        created_by: user.id,
        status: 'pending',
      } as CareTask;

      // Mock creating a task
      const mockCreatedTask: CareTask = {
        ...taskToCreate,
        id: `new-${Date.now()}`,
        created_at: new Date().toISOString(),
        created_by: user.id,
        status: 'pending',
        due_date: new Date(taskToCreate.due_date),
      };
      
      setTasks([...tasks, mockCreatedTask]);
      setOpenDialog(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: 'Task created',
        description: 'The task has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Failed to create task',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask || !user) return;

    try {
      // Mock updating a task
      const updatedTasks = tasks.map(task => 
        task.id === editTask.id ? editTask : task
      );
      
      setTasks(updatedTasks);
      setOpenDialog(false);
      setEditTask(null);

      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Failed to update task',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // Update task status to completed
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: 'completed',
            completed_at: new Date(),
            completed_by: user?.id,
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      toast({
        title: 'Task completed',
        description: 'The task has been marked as completed.',
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Failed to complete task',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const openAddTaskDialog = () => {
    setDialogMode('add');
    setOpenDialog(true);
  };

  const openEditTaskDialog = (task: CareTask) => {
    setDialogMode('edit');
    setEditTask(task);
    setOpenDialog(true);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      return;
    }

    // Moving between columns (changing status)
    const tasksCopy = [...tasks];
    const taskIndex = tasksCopy.findIndex(t => t.id === result.draggableId);
    
    if (taskIndex !== -1) {
      tasksCopy[taskIndex].status = destination.droppableId as CareTask['status'];
      setTasks(tasksCopy);
      
      // In a real app, you would update the task in the database here
    }
  };

  // Group tasks by status for the Kanban board
  const tasksByStatus: Record<string, CareTask[]> = {
    pending: [],
    in_progress: [],
    completed: [],
  };

  tasks.forEach(task => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Care Tasks</h2>
        <Button onClick={openAddTaskDialog} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Column */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Pending</h3>
            <Droppable droppableId="pending">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[200px] p-3"
                >
                  {tasksByStatus.pending.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3 cursor-pointer"
                          onClick={() => openEditTaskDialog(task)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* In Progress Column */}
          <div>
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <Droppable droppableId="in_progress">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[200px] p-3"
                >
                  {tasksByStatus.in_progress.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3 cursor-pointer"
                          onClick={() => openEditTaskDialog(task)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteTask(task.id);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" /> Done
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Completed Column */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Completed</h3>
            <Droppable droppableId="completed">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[200px] p-3"
                >
                  {tasksByStatus.completed.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3 cursor-pointer opacity-80"
                          onClick={() => openEditTaskDialog(task)}
                        >
                          <CardContent className="p-3">
                            <div>
                              <h4 className="font-medium line-through">{task.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <Check className="h-3 w-3 mr-1" />
                                Completed on {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Add details for the new care task.' : 'Update the details of this care task.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={dialogMode === 'add' ? newTask.title : editTask?.title || ''}
                onChange={(e) => dialogMode === 'add' 
                  ? setNewTask({...newTask, title: e.target.value})
                  : setEditTask(editTask ? {...editTask, title: e.target.value} : null)
                }
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={dialogMode === 'add' ? newTask.description : editTask?.description || ''}
                onChange={(e) => dialogMode === 'add'
                  ? setNewTask({...newTask, description: e.target.value})
                  : setEditTask(editTask ? {...editTask, description: e.target.value} : null)
                }
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={dialogMode === 'add' ? newTask.priority : editTask?.priority}
                onValueChange={(value) => dialogMode === 'add'
                  ? setNewTask({...newTask, priority: value as 'high' | 'medium' | 'low'})
                  : setEditTask(editTask ? {...editTask, priority: value as 'high' | 'medium' | 'low'} : null)
                }
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                value={dialogMode === 'add' ? newTask.category : editTask?.category || ''}
                onChange={(e) => dialogMode === 'add'
                  ? setNewTask({...newTask, category: e.target.value})
                  : setEditTask(editTask ? {...editTask, category: e.target.value} : null)
                }
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                value={dialogMode === 'add' 
                  ? typeof newTask.due_date === 'string' ? newTask.due_date : new Date().toISOString().split('T')[0]
                  : typeof editTask?.due_date === 'string'
                    ? editTask.due_date 
                    : editTask?.due_date instanceof Date
                      ? editTask.due_date.toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                }
                onChange={(e) => dialogMode === 'add'
                  ? setNewTask({...newTask, due_date: e.target.value})
                  : setEditTask(editTask ? {...editTask, due_date: e.target.value} : null)
                }
                className="col-span-3"
              />
            </div>
            
            {dialogMode === 'edit' && editTask?.status === 'completed' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="completion_notes" className="text-right">
                  Completion Notes
                </Label>
                <Textarea
                  id="completion_notes"
                  value={editTask?.completion_notes || ''}
                  onChange={(e) => setEditTask(editTask ? {...editTask, completion_notes: e.target.value} : null)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={dialogMode === 'add' ? handleCreateTask : handleUpdateTask}
              disabled={dialogMode === 'add' ? !newTask.title : !editTask?.title}
            >
              {dialogMode === 'add' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
