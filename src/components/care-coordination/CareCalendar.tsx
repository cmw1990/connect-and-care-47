import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarPlus, Users, Car, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'transportation' | 'meal' | 'general';
  assignedTo: string[];
  description: string;
}

export const CareCalendar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [newTask, setNewTask] = React.useState<Partial<Task>>({
    type: 'general',
    date: new Date(),
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.date) {
      toast({
        title: t('error.invalidTask'),
        description: t('error.pleaseCompleteAllFields'),
        variant: 'destructive',
      });
      return;
    }

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      date: newTask.date,
      type: newTask.type || 'general',
      assignedTo: newTask.assignedTo || [],
      description: newTask.description || '',
    };

    setTasks([...tasks, task]);
    setIsAddingTask(false);
    setNewTask({
      type: 'general',
      date: new Date(),
    });

    toast({
      title: t('success.taskAdded'),
      description: t('success.taskAddedDescription'),
    });
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'appointment':
        return <CalendarPlus className="h-4 w-4" />;
      case 'transportation':
        return <Car className="h-4 w-4" />;
      case 'meal':
        return <Utensils className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('careCalendar.title')}</CardTitle>
          <CardDescription>{t('careCalendar.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {t('careCalendar.tasks')}
                </h3>
                <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      {t('careCalendar.addTask')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('careCalendar.newTask')}</DialogTitle>
                      <DialogDescription>
                        {t('careCalendar.newTaskDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">{t('careCalendar.taskTitle')}</Label>
                        <Input
                          id="title"
                          value={newTask.title || ''}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">{t('careCalendar.taskType')}</Label>
                        <Select
                          value={newTask.type}
                          onValueChange={(value: Task['type']) =>
                            setNewTask({ ...newTask, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="appointment">
                              {t('careCalendar.typeAppointment')}
                            </SelectItem>
                            <SelectItem value="transportation">
                              {t('careCalendar.typeTransportation')}
                            </SelectItem>
                            <SelectItem value="meal">
                              {t('careCalendar.typeMeal')}
                            </SelectItem>
                            <SelectItem value="general">
                              {t('careCalendar.typeGeneral')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">
                          {t('careCalendar.description')}
                        </Label>
                        <Input
                          id="description"
                          value={newTask.description || ''}
                          onChange={(e) =>
                            setNewTask({ ...newTask, description: e.target.value })
                          }
                        />
                      </div>
                      <Button onClick={handleAddTask}>
                        {t('careCalendar.addTask')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter(
                    (task) =>
                      task.date.toDateString() === date?.toDateString()
                  )
                  .map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          {getTaskIcon(task.type)}
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-500">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
