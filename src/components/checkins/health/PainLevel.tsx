import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface PainLevelProps {
  painLevel: number | null;
  onPainLevelChange: (value: number) => void;
}

export const PainLevel = ({ painLevel, onPainLevelChange }: PainLevelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pain Level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Slider
            value={painLevel ? [painLevel] : [0]}
            onValueChange={(value) => onPainLevelChange(value[0])}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>No Pain</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};