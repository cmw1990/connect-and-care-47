import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Video, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CallSchedulerProps {
  providerId: string;
  providerType: 'caregiver' | 'companion';
  providerName: string;
}

export const CallScheduler = ({ providerId, providerType, providerName }: CallSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const { toast } = useToast();

  const scheduleCall = async () => {
    if (!selectedDate) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('video_consultations')
        .insert({
          host_id: providerId,
          title: `${callType === 'video' ? 'Video' : 'Voice'} call with ${providerName}`,
          scheduled_time: selectedDate.toISOString(),
          duration: 30,
          status: 'scheduled',
          participants: [{ id: user.id, role: 'requester' }],
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${callType === 'video' ? 'Video' : 'Voice'} call scheduled successfully`,
      });
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule call",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {callType === 'video' ? (
            <Video className="h-5 w-5" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
          Schedule a Call
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={callType === 'video' ? 'default' : 'outline'}
              onClick={() => setCallType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button
              variant={callType === 'voice' ? 'default' : 'outline'}
              onClick={() => setCallType('voice')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />

          <Button
            className="w-full"
            onClick={scheduleCall}
            disabled={!selectedDate}
          >
            Schedule {callType === 'video' ? 'Video' : 'Voice'} Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};