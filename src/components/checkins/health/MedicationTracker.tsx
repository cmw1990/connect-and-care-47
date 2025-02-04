import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";

interface MedicationTrackerProps {
  medicationTaken: boolean;
  onMedicationStatusChange: (taken: boolean) => void;
}

export const MedicationTracker = ({ medicationTaken, onMedicationStatusChange }: MedicationTrackerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Medication Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="medicationTaken">Have you taken your medications today?</Label>
          <Switch
            id="medicationTaken"
            checked={medicationTaken}
            onCheckedChange={onMedicationStatusChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};