import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { MoodTracker } from "../health/MoodTracker";
import { PainLevel } from "../health/PainLevel";
import { SleepTracker } from "../health/SleepTracker";
import { MedicationTracker } from "../health/MedicationTracker";
import { NutritionLog } from "../health/NutritionLog";
import { VitalSigns } from "../health/VitalSigns";
import { SocialInteractions } from "../social/SocialInteractions";
import { WeatherAlert } from "../weather/WeatherAlert";

interface CheckInFormProps {
  onSubmit: (data: any) => void;
  submitting: boolean;
}

export const CheckInForm = ({ onSubmit, submitting }: CheckInFormProps) => {
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

  const handleSubmit = () => {
    onSubmit({
      moodScore,
      painLevel,
      sleepHours,
      medicationTaken,
      nutritionLog,
      vitalSigns,
      socialInteractions,
    });
  };

  return (
    <div className="space-y-4">
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
        onClick={handleSubmit}
        disabled={submitting}
      >
        <Check className="mr-2 h-4 w-4" />
        Complete Check-in
      </Button>
    </div>
  );
};