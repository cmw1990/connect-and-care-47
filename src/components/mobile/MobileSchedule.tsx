import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { format, addDays, isSameDay } from 'date-fns';
import { SwipeableContainer } from './MobileGestures';
import { supabase } from '@/lib/supabase/client';

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'medication' | 'appointment' | 'activity' | 'measurement';
  status: 'pending' | 'completed' | 'missed';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export const MobileSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);

  useEffect(() => {
    updateVisibleDays(selectedDate);
    fetchEvents(selectedDate);

    const subscription = supabase
      .channel('schedule_events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schedule_events' },
        handleEventUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDate]);

  const updateVisibleDays = (centerDate: Date) => {
    const days = [-2, -1, 0, 1, 2].map(offset => addDays(centerDate, offset));
    setVisibleDays(days);
  };

  const handleEventUpdate = async (payload: any) => {
    const event = payload.new as ScheduleEvent;
    if (isSameDay(new Date(event.startTime), selectedDate)) {
      await Haptics.impact({ style: ImpactStyle.Light });
      fetchEvents(selectedDate);
    }
  };

  const fetchEvents = async (date: Date) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .gte('startTime', date.toISOString().split('T')[0])
        .lt('startTime', addDays(date, 1).toISOString().split('T')[0])
        .order('startTime', { ascending: true });

      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (direction: 'left' | 'right') => {
    const newDate = addDays(selectedDate, direction === 'left' ? -1 : 1);
    await Haptics.impact({ style: ImpactStyle.Medium });
    setSelectedDate(newDate);
  };

  const handleEventPress = async (event: ScheduleEvent) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    // Handle event selection
  };

  const handleEventComplete = async (eventId: string) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    try {
      const { error } = await supabase
        .from('schedule_events')
        .update({ status: 'completed' })
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing event:', error);
    }
  };

  const getEventColor = (type: ScheduleEvent['type'], priority: ScheduleEvent['priority']) => {
    const baseColors = {
      medication: 'bg-blue-500',
      appointment: 'bg-purple-500',
      activity: 'bg-green-500',
      measurement: 'bg-orange-500',
    };

    const priorityAlpha = {
      low: 'opacity-75',
      medium: 'opacity-85',
      high: 'opacity-100',
    };

    return `${baseColors[type]} ${priorityAlpha[priority]}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Date Slider */}
      <SwipeableContainer
        onSwipe={direction => handleDateChange(direction as 'left' | 'right')}
        className="px-4 py-3 bg-white dark:bg-gray-800 shadow-sm"
      >
        <div className="flex justify-between items-center">
          <motion.div
            className="flex space-x-4 overflow-x-auto scrollbar-hide"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
          >
            {visibleDays.map((date, index) => (
              <motion.button
                key={date.toISOString()}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isSameDay(date, selectedDate)
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {format(date, 'd')}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </SwipeableContainer>

      {/* Events List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {events.map(event => (
              <motion.div
                key={event.id}
                className={`rounded-lg shadow-sm ${getEventColor(event.type, event.priority)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEventPress(event)}
              >
                <div className="p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm opacity-90">
                        {format(new Date(event.startTime), 'h:mm a')}
                      </p>
                    </div>
                    {event.status !== 'completed' && (
                      <motion.button
                        className="p-2 rounded-full bg-white bg-opacity-20"
                        whileTap={{ scale: 0.9 }}
                        onClick={e => {
                          e.stopPropagation();
                          handleEventComplete(event.id);
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                  {event.notes && (
                    <p className="mt-2 text-sm opacity-90">{event.notes}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">No events scheduled</p>
                <p className="text-sm">Tap + to add a new event</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Button */}
      <motion.button
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white"
        whileTap={{ scale: 0.9 }}
        onClick={async () => {
          await Haptics.impact({ style: ImpactStyle.Medium });
          // Handle add event
        }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </motion.button>
    </div>
  );
};
