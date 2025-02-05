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
}

export const CheckInForm = ({ onSubmit }: CheckInFormProps) => {
  const [formData, setFormData] = useState({
    mood_score: 5,
    pain_level: 0,
    sleep_hours: 8,
    notes: "",
    vital_signs: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <MoodTracker
          value={formData.mood_score}
          onChange={(value) => setFormData({ ...formData, mood_score: value })}
        />
        
        <PainLevel
          value={formData.pain_level}
          onChange={(value) => setFormData({ ...formData, pain_level: value })}
        />
        
        <SleepTracker
          value={formData.sleep_hours}
          onChange={(value) => setFormData({ ...formData, sleep_hours: value })}
        />
        
        <VitalSigns
          value={formData.vital_signs}
          onChange={(value) => setFormData({ ...formData, vital_signs: value })}
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

      <Button type="submit" className="w-full">
        Submit Check-in
      </Button>
    </form>
  );
};