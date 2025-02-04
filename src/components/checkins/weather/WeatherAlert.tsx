import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, Thermometer } from "lucide-react";

interface WeatherAlertProps {
  conditions: {
    temperature?: number;
    condition?: string;
    warning?: string;
  };
}

export const WeatherAlert = ({ conditions }: WeatherAlertProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              <span>{conditions.temperature}°F</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              <span>{conditions.condition}</span>
            </div>
          </div>
          {conditions.warning && (
            <div className="p-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              {conditions.warning}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};