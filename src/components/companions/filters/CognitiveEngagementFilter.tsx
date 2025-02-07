import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";

interface CognitiveEngagementFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const CognitiveEngagementFilter = ({ value, onChange }: CognitiveEngagementFilterProps) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Brain className="h-4 w-4 text-primary" />
        Cognitive Activities
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select activity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="memory_games">Memory Games</SelectItem>
          <SelectItem value="brain_teasers">Brain Teasers</SelectItem>
          <SelectItem value="social_activities">Social Activities</SelectItem>
          <SelectItem value="creative_exercises">Creative Exercises</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};