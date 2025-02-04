import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VitalSignsProps {
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenLevel?: string;
  };
  onChange: (vitalSigns: any) => void;
}

export const VitalSigns = ({ vitalSigns, onChange }: VitalSignsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Signs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bloodPressure">Blood Pressure</Label>
          <Input
            id="bloodPressure"
            value={vitalSigns.bloodPressure || ''}
            onChange={(e) => onChange({ ...vitalSigns, bloodPressure: e.target.value })}
            placeholder="120/80"
          />
        </div>
        <div>
          <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
          <Input
            id="heartRate"
            value={vitalSigns.heartRate || ''}
            onChange={(e) => onChange({ ...vitalSigns, heartRate: e.target.value })}
            placeholder="72"
          />
        </div>
        <div>
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            value={vitalSigns.temperature || ''}
            onChange={(e) => onChange({ ...vitalSigns, temperature: e.target.value })}
            placeholder="98.6"
          />
        </div>
        <div>
          <Label htmlFor="oxygenLevel">Oxygen Level (%)</Label>
          <Input
            id="oxygenLevel"
            value={vitalSigns.oxygenLevel || ''}
            onChange={(e) => onChange({ ...vitalSigns, oxygenLevel: e.target.value })}
            placeholder="98"
          />
        </div>
      </CardContent>
    </Card>
  );
};