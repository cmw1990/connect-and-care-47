import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video, Phone, Clock } from "lucide-react";

interface ConsultationSchedulerProps {
  providerId: string;
  providerType: 'caregiver' | 'companion';
  onScheduled?: () => void;
}

export const ConsultationScheduler = ({ 
  providerId, 
  providerType,
  onScheduled 
}: ConsultationSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [consultationType, setConsultationType] = useState<'video' | 'voice'>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !consultationType) {
      toast({
        title: "Error",
        description: "Please select date, time and consultation type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to schedule consultations",
          variant: "destructive",
        });
        return;
      }

      const scheduledTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('video_consultations')
        .insert({
          host_id: providerId,
          title: `${consultationType === 'video' ? 'Video' : 'Voice'} Consultation`,
          scheduled_time: scheduledTime.toISOString(),
          duration: 60,
          status: 'scheduled',
          meeting_url: null, // Will be generated when consultation starts
          participants: [{ id: user.id, role: 'participant' }]
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Consultation scheduled successfully",
      });

      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      toast({
        title: "Error",
        description: "Failed to schedule consultation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Consultation Type</label>
          <div className="flex gap-2">
            <Button
              variant={consultationType === 'video' ? 'default' : 'outline'}
              onClick={() => setConsultationType('video')}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Video Call
            </Button>
            <Button
              variant={consultationType === 'voice' ? 'default' : 'outline'}
              onClick={() => setConsultationType('voice')}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Voice Call
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Time</label>
          <Select onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
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

        <Button 
          onClick={handleSchedule} 
          disabled={isLoading || !selectedDate || !selectedTime || !consultationType}
          className="w-full"
        >
          Schedule {consultationType === 'video' ? 'Video' : 'Voice'} Call
        </Button>
      </CardContent>
    </Card>
  );
};