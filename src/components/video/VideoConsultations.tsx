
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Video, Users, Calendar } from "lucide-react";

interface VideoConsultation {
  id: string;
  title: string;
  scheduled_time: string;
  meeting_url: string | null;
  status: string | null;
  participants: any[] | null;
  host_id: string | null;
  duration: number | null;
  host?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const VideoConsultations = ({ groupId }: { groupId: string }) => {
  const [consultations, setConsultations] = useState<VideoConsultation[]>([]);
  const [newConsultation, setNewConsultation] = useState({
    title: "",
    scheduled_time: "",
    duration: 30,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConsultations();
  }, [groupId]);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from("video_consultations")
        .select(`
          *,
          host:host_id (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure participants is always an array
      const transformedData = (data || []).map(consultation => ({
        ...consultation,
        participants: Array.isArray(consultation.participants) 
          ? consultation.participants 
          : []
      }));
      
      setConsultations(transformedData);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast({
        title: "Error",
        description: "Failed to load video consultations",
        variant: "destructive",
      });
    }
  };

  const handleCreateConsultation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("video_consultations").insert({
        group_id: groupId,
        host_id: user.id,
        title: newConsultation.title,
        scheduled_time: newConsultation.scheduled_time,
        duration: newConsultation.duration,
        status: "scheduled",
        meeting_url: `https://meet.jit.si/${groupId}-${Date.now()}`,
        participants: [], // Initialize with empty array
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video consultation scheduled successfully",
      });

      fetchConsultations();
      setNewConsultation({
        title: "",
        scheduled_time: "",
        duration: 30,
      });
    } catch (error) {
      console.error("Error creating consultation:", error);
      toast({
        title: "Error",
        description: "Failed to schedule video consultation",
        variant: "destructive",
      });
    }
  };

  const joinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Consultations
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Consultation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Video Consultation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newConsultation.title}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        title: e.target.value,
                      })
                    }
                    placeholder="Consultation title"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Date & Time</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={newConsultation.scheduled_time}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        scheduled_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newConsultation.duration}
                    onChange={(e) =>
                      setNewConsultation({
                        ...newConsultation,
                        duration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <Button onClick={handleCreateConsultation} className="w-full">
                  Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{consultation.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(consultation.scheduled_time).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {consultation.duration} minutes
                </div>
              </div>
              {consultation.meeting_url && (
                <Button
                  variant="outline"
                  onClick={() => joinMeeting(consultation.meeting_url!)}
                >
                  Join Meeting
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
