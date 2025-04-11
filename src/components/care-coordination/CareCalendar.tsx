
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeSupabaseQuery, mockTableQuery } from '@/utils/supabaseHelpers';
import { DayContentProps } from '@/types/supabase';

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
      // For tasks, use care_tasks table which does exist in the schema
      const careTasksPromise = safeSupabaseQuery(
        async () => supabase
          .from('care_tasks')
          .select('*')
          .eq('team_id', groupId),
        [] as CareTask[]
      );

      // For other tables that might not exist yet, use mock data until tables are created
      const appointmentsPromise = mockTableQuery<any>([
        {
          id: 'mock-apt-1',
          title: 'Doctor Appointment',
          appointment_date: new Date().toISOString(),
          status: 'scheduled'
        }
      ]);

      const medicationsPromise = mockTableQuery<any>([
        {
          id: 'mock-med-1',
          medication_name: 'Daily Medication',
          group_id: groupId
        }
      ]);

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

  const getDayContent = (date: Date) => {
    const dateKey = formatDateKey(date);
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
                DayContent: ({ date }: DayContentProps) => getDayContent(date),
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Events for {selectedDate?.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4 text-muted-foreground">Loading events...</div>
            ) : getSelectedDateEvents().length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No events for this day</div>
            ) : (
              <ul className="space-y-3">
                {getSelectedDateEvents().map((event) => (
                  <li key={event.id} className="border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {new Date(event.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <Badge variant={event.status === 'completed' ? 'success' : 'outline'}>
                        {event.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
