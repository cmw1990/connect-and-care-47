import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Moon, Sun } from "lucide-react";

interface SleepTrackerProps {
  sleepHours: number | null;
  onSleepHoursChange: (hours: number) => void;
}

export const SleepTracker = ({ sleepHours, onSleepHoursChange }: SleepTrackerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Sleep Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sleepHours">Hours of Sleep</Label>
            <div className="flex items-center gap-2">
              <Input
                id="sleepHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={sleepHours || ''}
                onChange={(e) => onSleepHoursChange(parseFloat(e.target.value))}
                placeholder="8"
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};