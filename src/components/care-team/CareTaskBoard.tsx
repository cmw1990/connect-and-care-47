
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogTrigger, DialogContent, DialogTitle, 
  DialogHeader, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface CareTask {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: 'pending' | 'inProgress' | 'completed';
  assigned_to?: string;
  due_date?: Date;
  completion_notes?: string;
  completed_at?: Date;
  completed_by?: string;
  recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_after?: number;
    end_date?: Date;
  };
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskColumn {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: { [key: string]: CareTask };
  columns: { [key: string]: TaskColumn };
  columnOrder: string[];
}

const CareTaskBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>({
    tasks: {},
    columns: {
      pending: { id: 'pending', title: 'To Do', taskIds: [] },
      inProgress: { id: 'inProgress', title: 'In Progress', taskIds: [] },
      completed: { id: 'completed', title: 'Completed', taskIds: [] },
    },
    columnOrder: ['pending', 'inProgress', 'completed'],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('general');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Mock fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        
        // Mock data
        const mockTasks: CareTask[] = [
          {
            id: '1',
            team_id: 'team-1',
            title: 'Morning Medication',
            description: 'Administer morning medications as prescribed',
            category: 'medication',
            priority: 'high',
            status: 'pending',
            recurring: true,
            created_by: 'user-1',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            team_id: 'team-1',
            title: 'Physical Therapy',
            description: 'Complete daily mobility exercises',
            category: 'therapy',
            priority: 'medium',
            status: 'inProgress',
            recurring: false,
            created_by: 'user-2',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            team_id: 'team-1',
            title: 'Doctor Appointment',
            description: 'Schedule follow-up appointment with Dr. Smith',
            category: 'appointment',
            priority: 'medium',
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: 'user-3',
            recurring: false,
            created_by: 'user-1',
            created_at: new Date().toISOString()
          },
        ];
        
        // Process the tasks
        const tasksById: { [key: string]: CareTask } = {};
        const taskIdsByColumn: { [key: string]: string[] } = {
          pending: [],
          inProgress: [],
          completed: [],
        };
        
        mockTasks.forEach(task => {
          tasksById[task.id] = task;
          taskIdsByColumn[task.status].push(task.id);
        });
        
        setBoardData(prev => ({
          ...prev,
          tasks: tasksById,
          columns: {
            pending: { ...prev.columns.pending, taskIds: taskIdsByColumn.pending },
            inProgress: { ...prev.columns.inProgress, taskIds: taskIdsByColumn.inProgress },
            completed: { ...prev.columns.completed, taskIds: taskIdsByColumn.completed },
          },
        }));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      // Create a new task locally
      const newTask: CareTask = {
        id: `temp-${Date.now()}`,
        team_id: 'team-1', // Mock team ID
        title: newTaskTitle,
        description: newTaskDescription,
        category: newTaskCategory,
        priority: newTaskPriority,
        status: 'pending',
        recurring: false,
        created_by: 'user-1', // Mock user ID
        created_at: new Date().toISOString(),
      };
      
      // Update state
      setBoardData(prev => {
        const updatedTasks = { ...prev.tasks, [newTask.id]: newTask };
        const updatedPendingColumn = {
          ...prev.columns.pending,
          taskIds: [...prev.columns.pending.taskIds, newTask.id],
        };
        
        return {
          ...prev,
          tasks: updatedTasks,
          columns: {
            ...prev.columns,
            pending: updatedPendingColumn,
          },
        };
      });
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskCategory('general');
      setNewTaskPriority('medium');
      
      toast({
        title: "Task created",
        description: "New task has been added to the board"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If no destination or dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get source and destination columns
    const sourceColumn = boardData.columns[source.droppableId];
    const destinationColumn = boardData.columns[destination.droppableId];
    
    // Update task status if column changed
    let updatedTasks = { ...boardData.tasks };
    if (sourceColumn.id !== destinationColumn.id) {
      updatedTasks = {
        ...updatedTasks,
        [draggableId]: {
          ...updatedTasks[draggableId],
          status: destinationColumn.id as CareTask['status'],
          ...(destinationColumn.id === 'completed' 
            ? { 
                completed_at: new Date().toISOString(),
                completed_by: 'user-1', // Mock user ID
              } 
            : {}
          ),
        }
      };
    }
    
    // If same column
    if (sourceColumn === destinationColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      
      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };
      
      setBoardData({
        ...boardData,
        tasks: updatedTasks,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn,
        },
      });
      
      return;
    }
    
    // If different columns
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };
    
    const destinationTaskIds = Array.from(destinationColumn.taskIds);
    destinationTaskIds.splice(destination.index, 0, draggableId);
    const newDestinationColumn = {
      ...destinationColumn,
      taskIds: destinationTaskIds,
    };
    
    setBoardData({
      ...boardData,
      tasks: updatedTasks,
      columns: {
        ...boardData.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    });
    
    // Mock update task status in database
    toast({
      title: "Task updated",
      description: `Task status changed to ${destinationColumn.title}`
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Care Tasks</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
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
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newTaskCategory}
                    onValueChange={(value) => setNewTaskCategory(value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTaskPriority}
                    onValueChange={(value: 'high' | 'medium' | 'low') => setNewTaskPriority(value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={createTask} disabled={!newTaskTitle.trim()}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
            
            return (
              <div key={column.id} className="flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  {column.id === 'pending' && <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />}
                  {column.id === 'inProgress' && <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />}
                  {column.id === 'completed' && <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                  {column.title}
                  <span className="ml-2 text-muted-foreground">({column.taskIds.length})</span>
                </h3>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 space-y-3 min-h-[300px]"
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border-l-4 border-l-primary"
                            >
                              <CardContent className="p-3">
                                <h4 className="font-semibold text-sm">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      task.priority === 'high' 
                                        ? 'bg-red-100 text-red-800' 
                                        : task.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                      {task.category}
                                    </span>
                                  </div>
                                  {task.completed_at && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(task.completed_at).toLocaleDateString()}
                                    </span>
                                  )}
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
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default CareTaskBoard;
