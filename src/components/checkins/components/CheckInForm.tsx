import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoodTracker } from "../health/MoodTracker";
import { PainLevel } from "../health/PainLevel";
import { SleepTracker } from "../health/SleepTracker";
import { VitalSigns } from "../health/VitalSigns";

interface CheckInFormProps {
  onSubmit: (data: any) => void;
  submitting?: boolean;
}

export const CheckInForm = ({ onSubmit, submitting = false }: CheckInFormProps) => {
  const [formData, setFormData] = useState({
    moodScore: 5,
    painLevel: 0,
    sleepHours: 8,
    notes: "",
    vitalSigns: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <MoodTracker
          moodScore={formData.moodScore}
          onMoodSelect={(value) => setFormData({ ...formData, moodScore: value })}
        />
        
        <PainLevel
          painLevel={formData.painLevel}
          onPainLevelChange={(value) => setFormData({ ...formData, painLevel: value })}
        />
        
        <SleepTracker
          sleepHours={formData.sleepHours}
          onSleepHoursChange={(value) => setFormData({ ...formData, sleepHours: value })}
        />
        
        <VitalSigns
          vitalSigns={formData.vitalSigns}
          onChange={(value) => setFormData({ ...formData, vitalSigns: value })}
        />

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about your condition..."
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Check-in"}
      </Button>
    </form>
  );
};