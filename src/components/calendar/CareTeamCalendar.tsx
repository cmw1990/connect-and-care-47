
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { castQueryResult, createMockProfile } from '@/utils/supabaseHelpers';

export interface Availability {
  id: string;
  user_id: string;
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  }[];
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface CareTeamCalendarProps {
  teamId: string;
  onError: (error: Error) => void;
}

// Mock data
const mockAvailability: Availability[] = [
  {
    id: "1",
    user_id: "user-1",
    available_days: ["Monday", "Tuesday", "Wednesday"],
    available_hours: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" }
    ],
    profiles: {
      first_name: "John",
      last_name: "Doe"
    }
  },
  {
    id: "2",
    user_id: "user-2",
    available_days: ["Thursday", "Friday", "Saturday"],
    available_hours: [
      { start: "10:00", end: "18:00" }
    ],
    profiles: {
      first_name: "Jane",
      last_name: "Smith"
    }
  }
];

export function CareTeamCalendar({ teamId, onError }: CareTeamCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [teamId]);

  const fetchAvailability = async () => {
    try {
      // In a real implementation, fetch from database
      // For now, use mock data
      setTimeout(() => {
        setAvailability(mockAvailability);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching availability:', error);
      onError(error as Error);
      setIsLoading(false);
    }
  };

  const handleUpdateAvailability = async (data: Partial<Availability>) => {
    try {
      // In a real implementation, update database
      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      onError(error as Error);
    }
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = daysOfWeek[date.getDay()];
  
  const availableMembers = availability.filter(item => 
    item.available_days.includes(currentDay)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Team Availability</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Availability
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Availability</DialogTitle>
            </DialogHeader>
            {/* Form would go here */}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border shadow-sm"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Available on {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members available on this day
              </div>
            ) : (
              <div className="space-y-4">
                {availableMembers.map((member) => (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {member.profiles?.first_name || 'Unknown'} {member.profiles?.last_name || 'User'}
                    </div>
                    <div className="mt-2 space-y-1">
                      {member.available_hours.map((hours, idx) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {hours.start} - {hours.end}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
