import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart } from "lucide-react";

interface SpecializedCareFiltersProps {
  dementiaOnly: boolean;
  mentalHealthOnly: boolean;
  onDementiaChange: (value: boolean) => void;
  onMentalHealthChange: (value: boolean) => void;
}

export const SpecializedCareFilters = ({
  dementiaOnly,
  mentalHealthOnly,
  onDementiaChange,
  onMentalHealthChange
}: SpecializedCareFiltersProps) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Specialized Care</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <Label htmlFor="dementia-care">Dementia Care</Label>
        </div>
        <div className="flex items-center gap-2">
          {dementiaOnly && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Certified
            </Badge>
          )}
          <Switch
            id="dementia-care"
            checked={dementiaOnly}
            onCheckedChange={onDementiaChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-rose-500" />
          <Label htmlFor="mental-health">Mental Health Support</Label>
        </div>
        <div className="flex items-center gap-2">
          {mentalHealthOnly && (
            <Badge variant="secondary" className="bg-rose-100 text-rose-800">
              Certified
            </Badge>
          )}
          <Switch
            id="mental-health"
            checked={mentalHealthOnly}
            onCheckedChange={onMentalHealthChange}
          />
        </div>
      </div>
    </div>
  );
};