
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VoiceReminderProps {
  groupId: string;
  settings?: {
    voice_reminders?: boolean;
    preferred_voice?: string;
  };
}

export const VoiceReminder = ({ groupId, settings }: VoiceReminderProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(settings?.voice_reminders ?? false);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  const playVoiceReminder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reminder } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: "Time to take your medication. Please don't forget to log it in the system.",
          voice: settings?.preferred_voice || "alloy"
        }
      });

      if (reminder?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(reminder.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        
        newAudio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        setAudio(newAudio);
        await newAudio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing voice reminder:', error);
      toast({
        title: "Error",
        description: "Failed to play voice reminder",
        variant: "destructive",
      });
    }
  };

  const togglePlay = () => {
    if (isPlaying && audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      playVoiceReminder();
    }
  };

  const toggleVoiceReminders = async () => {
    try {
      const { error } = await supabase
        .from('medication_portal_settings')
        .update({
          reminder_preferences: {
            ...settings,
            voice_reminders: !voiceEnabled
          }
        })
        .eq('group_id', groupId);

      if (error) throw error;

      setVoiceEnabled(!voiceEnabled);
      toast({
        title: "Settings Updated",
        description: `Voice reminders ${!voiceEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating voice settings:', error);
      toast({
        title: "Error",
        description: "Failed to update voice reminder settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {voiceEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            Voice Reminders
          </span>
        </div>
        <Switch
          checked={voiceEnabled}
          onCheckedChange={toggleVoiceReminders}
        />
      </div>

      <Button
        onClick={togglePlay}
        disabled={!voiceEnabled}
        variant="outline"
        className="w-full"
      >
        {isPlaying ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Test Reminder
          </>
        )}
      </Button>
    </div>
  );
};
