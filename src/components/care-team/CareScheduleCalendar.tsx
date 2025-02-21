import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { careTeamService } from '@/lib/supabase/care-team-service';
import type { CareSchedule } from '@/lib/supabase/care-team-service';
import { useUser } from '@/lib/hooks/use-user';

const createScheduleSchema = z.object({
  title: z.string().min(1, 'Schedule title is required'),
  description: z.string().optional(),
  scheduleType: z.string().min(1, 'Schedule type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  recurring: z.boolean().default(false),
});

interface CareScheduleCalendarProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function CareScheduleCalendar({ teamId, onError }: CareScheduleCalendarProps) {
  const { user } = useUser();
  const [schedules, setSchedules] = React.useState<CareSchedule[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      title: '',
      description: '',
      scheduleType: '',
      startDate: '',
      endDate: '',
      recurring: false,
    },
  });

  const loadSchedules = React.useCallback(async () => {
    try {
      const schedules = await careTeamService.getCareSchedules(teamId);
      setSchedules(schedules);
    } catch (error) {
      onError(error as Error);
    }
  }, [teamId, onError]);

  React.useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleCreateSchedule = async (data: z.infer<typeof createScheduleSchema>) => {
    try {
      if (user) {
        await careTeamService.createCareSchedule({
          teamId,
          title: data.title,
          description: data.description,
          scheduleType: data.scheduleType,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          recurring: data.recurring,
          assignedTo: [],
          createdBy: user.id,
        });
        await loadSchedules();
        setIsCreateDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateSchedule)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter schedule title" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter schedule description" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-5">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
        <div className="col-span-2">
          <div className="bg-muted p-4 rounded-lg h-full">
            <h4 className="font-medium mb-4">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <div className="space-y-2">
              {getSchedulesForDate(selectedDate).map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-card p-3 rounded-md shadow-sm"
                >
                  <h5 className="font-medium">{schedule.title}</h5>
                  {schedule.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {schedule.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {schedule.scheduleType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(schedule.startDate).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {getSchedulesForDate(selectedDate).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No schedules for this date
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
