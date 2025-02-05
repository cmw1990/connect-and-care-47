import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilitySchedulerProps {
  profileId: string;
  profileType: 'caregiver' | 'companion';
  onScheduled?: () => void;
}

export const AvailabilityScheduler = ({
  profileId,
  profileType,
  onScheduled
}: AvailabilitySchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [recurring, setRecurring] = useState(false);
  const { toast } = useToast();

  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );

  const handleSchedule = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please select date and time slots",
        variant: "destructive",
      });
      return;
    }

    try {
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

      const { error } = await supabase
        .from('availability_slots')
        .insert({
          profile_id: profileId,
          profile_type: profileType,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          recurring
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability scheduled successfully",
      });

      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error('Error scheduling availability:', error);
      toast({
        title: "Error",
        description: "Failed to schedule availability",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Select onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Select onValueChange={setEndTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={recurring}
            onCheckedChange={setRecurring}
          />
          <Label htmlFor="recurring">Repeat weekly</Label>
        </div>

        <Button 
          onClick={handleSchedule}
          className="w-full"
          disabled={!selectedDate || !startTime || !endTime}
        >
          Schedule Availability
        </Button>
      </CardContent>
    </Card>
  );
};