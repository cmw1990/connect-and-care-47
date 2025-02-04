import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Activity, Heart } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { MoodTracker } from "./health/MoodTracker";
import { PainLevel } from "./health/PainLevel";
import { SleepTracker } from "./health/SleepTracker";
import { MedicationTracker } from "./health/MedicationTracker";
import { NutritionLog } from "./health/NutritionLog";
import { VitalSigns } from "./health/VitalSigns";
import { SocialInteractions } from "./social/SocialInteractions";
import { EmergencyAlert } from "./safety/EmergencyAlert";
import { WeatherAlert } from "./weather/WeatherAlert";

type PatientCheckIn = Tables<"patient_check_ins">;

export const PatientCheckIn = ({ groupId }: { groupId: string }) => {
  const [activeCheckIn, setActiveCheckIn] = useState<PatientCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [nutritionLog, setNutritionLog] = useState<{ meal: string; time: string }[]>([]);
  const [vitalSigns, setVitalSigns] = useState<{
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenLevel?: string;
  }>({});
  const [socialInteractions, setSocialInteractions] = useState<string[]>([]);
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

  const handleSubmitCheckIn = async () => {
    if (!activeCheckIn) return;
    
    try {
      setSubmitting(true);
      const checkInData = {
        status: 'completed',
        completed_time: new Date().toISOString(),
        mood_score: moodScore,
        pain_level: painLevel,
        sleep_hours: sleepHours,
        medication_taken: medicationTaken,
        nutrition_log: nutritionLog,
        vital_signs: vitalSigns,
        social_interactions: socialInteractions,
      };

      const { error } = await supabase
        .from('patient_check_ins')
        .update(checkInData)
        .eq('id', activeCheckIn.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check-in completed successfully",
      });

      setActiveCheckIn(null);
      // Reset all states
      setMoodScore(null);
      setPainLevel(null);
      setSleepHours(null);
      setMedicationTaken(false);
      setNutritionLog([]);
      setVitalSigns({});
      setSocialInteractions([]);
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
        <>
          <MoodTracker moodScore={moodScore} onMoodSelect={setMoodScore} />
          <PainLevel painLevel={painLevel} onPainLevelChange={setPainLevel} />
          <SleepTracker sleepHours={sleepHours} onSleepHoursChange={setSleepHours} />
          <MedicationTracker 
            medicationTaken={medicationTaken} 
            onMedicationStatusChange={setMedicationTaken} 
          />
          <NutritionLog 
            nutritionLog={nutritionLog} 
            onNutritionLogUpdate={setNutritionLog} 
          />
          <VitalSigns vitalSigns={vitalSigns} onChange={setVitalSigns} />
          <SocialInteractions 
            interactions={socialInteractions} 
            onInteractionAdd={(type) => setSocialInteractions([...socialInteractions, type])} 
          />
          <WeatherAlert conditions={{
            temperature: 72,
            condition: "Sunny",
            warning: "High UV index today. Remember to wear sunscreen."
          }} />
          
          <Button
            className="w-full mt-4"
            onClick={handleSubmitCheckIn}
            disabled={submitting}
          >
            <Check className="mr-2 h-4 w-4" />
            Complete Check-in
          </Button>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-6">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">No Active Check-ins</p>
            <p className="text-gray-500">
              You're all caught up! Your next check-in will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Activity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Check-in</p>
              <p className="font-medium">
                {format(new Date(), 'h:mm a')}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Next Check-in</p>
              <p className="font-medium">
                {format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'h:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};