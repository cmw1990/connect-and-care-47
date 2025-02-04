import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { EmergencyAlert } from "./safety/EmergencyAlert";
import { CheckInForm } from "./components/CheckInForm";
import { ActivityStatus } from "./components/ActivityStatus";
import { NoActiveCheckIn } from "./components/NoActiveCheckIn";

type PatientCheckIn = Tables<"patient_check_ins">;

export const PatientCheckIn = ({ groupId }: { groupId: string }) => {
  const [activeCheckIn, setActiveCheckIn] = useState<PatientCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveCheckIn();
    subscribeToCheckIns();
  }, [groupId]);

  const subscribeToCheckIns = () => {
    const channel = supabase
      .channel('patient-checkins')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_check_ins',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          fetchActiveCheckIn();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchActiveCheckIn = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_check_ins')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveCheckIn(data);
    } catch (error) {
      console.error('Error fetching active check-in:', error);
      toast({
        title: "Error",
        description: "Failed to load check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckIn = async (checkInData: any) => {
    if (!activeCheckIn) return;
    
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('patient_check_ins')
        .update({
          status: 'completed',
          completed_time: new Date().toISOString(),
          mood_score: checkInData.moodScore,
          pain_level: checkInData.painLevel,
          sleep_hours: checkInData.sleepHours,
          medication_taken: checkInData.medicationTaken,
          nutrition_log: checkInData.nutritionLog,
          vital_signs: checkInData.vitalSigns,
          social_interactions: checkInData.socialInteractions,
          caregiver_notes: checkInData.notes,
          photo_verification_url: checkInData.photoVerificationUrl,
        })
        .eq('id', activeCheckIn.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check-in completed successfully",
      });

      setActiveCheckIn(null);
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Error",
        description: "Failed to submit check-in",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EmergencyAlert groupId={groupId} />
      
      {activeCheckIn ? (
        <CheckInForm onSubmit={handleSubmitCheckIn} submitting={submitting} />
      ) : (
        <NoActiveCheckIn />
      )}

      <ActivityStatus />
    </div>
  );
};