
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeSupabaseQuery } from '@/utils/supabaseHelpers';

interface CareTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

interface CareEvent extends CareTask {
  type: 'task' | 'appointment' | 'medication';
  color: string;
}

export const CareCalendar = ({ groupId }: { groupId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Record<string, CareEvent[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to format date as a key for our events object
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchEvents();
  }, [groupId]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Using our safer query approach to avoid deep recursion
      const careTasksPromise = safeSupabaseQuery(
        async () => supabase
          .from('care_tasks')
          .select('*')
          .eq('team_id', groupId),
        [] as CareTask[]
      );

      const appointmentsPromise = safeSupabaseQuery(
        async () => supabase
          .from('care_appointments')
          .select('*')
          .eq('team_id', groupId),
        [] as any[]
      );

      const medicationsPromise = safeSupabaseQuery(
        async () => supabase
          .from('medication_schedules')
          .select('*')
          .eq('group_id', groupId),
        [] as any[]
      );

      const [careTasks, appointments, medications] = await Promise.all([
        careTasksPromise,
        appointmentsPromise,
        medicationsPromise
      ]);

      // Process the results
      const eventsByDate: Record<string, CareEvent[]> = {};
      
      // Process tasks
      careTasks.forEach((task: any) => {
        if (task.due_date) {
          const dateKey = formatDateKey(new Date(task.due_date));
          if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
          }
          eventsByDate[dateKey].push({
            ...task,
            type: 'task',
            color: getPriorityColor(task.priority || 'medium')
          });
        }
      });
      
      // Process appointments
      appointments.forEach((appointment: any) => {
        if (appointment.appointment_date) {
          const dateKey = formatDateKey(new Date(appointment.appointment_date));
          if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
          }
          eventsByDate[dateKey].push({
            id: appointment.id,
            title: appointment.title || 'Appointment',
            due_date: appointment.appointment_date,
            status: appointment.status || 'scheduled',
            priority: 'high',
            type: 'appointment',
            color: '#2563eb' // blue
          });
        }
      });
      
      // Process medications
      medications.forEach((medication: any) => {
        // For simplicity, we're adding medications for the next 7 days
        // In a real app, you'd generate dates based on the prescription schedule
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const dateKey = formatDateKey(date);
          
          if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
          }
          
          eventsByDate[dateKey].push({
            id: `${medication.id}-${i}`,
            title: `Take ${medication.medication_name}`,
            due_date: date.toISOString(),
            status: 'pending',
            priority: 'high',
            type: 'medication',
            color: '#16a34a' // green
          });
        }
      });
      
      setEvents(eventsByDate);

    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#dc2626'; // red
      case 'medium':
        return '#ca8a04'; // yellow
      case 'low':
        return '#16a34a'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const getDayContent = (day: Date) => {
    const dateKey = formatDateKey(day);
    const dayEvents = events[dateKey] || [];
    
    if (dayEvents.length === 0) return null;
    
    // Just show a colored dot for days with events
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="flex space-x-1 mb-1">
          {dayEvents.length > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </div>
      </div>
    );
  };

  const getSelectedDateEvents = (): CareEvent[] => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return events[dateKey] || [];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Care Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              components={{
                DayContent: ({ day }) => getDayContent(day),
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              }) : 'No Date Selected'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4">Loading events...</div>
            ) : (
              <>
                {getSelectedDateEvents().length === 0 ? (
                  <div className="text-center text-muted-foreground p-4">
                    No events scheduled for this day
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getSelectedDateEvents().map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-lg border flex items-start"
                        style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                      >
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={event.status === 'completed' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.due_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
