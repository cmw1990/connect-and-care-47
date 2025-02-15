
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { MedicationScheduleBase } from "@/types/medication";

interface UpcomingRemindersProps {
  schedules: MedicationScheduleBase[];
}

export const UpcomingReminders = ({ schedules }: UpcomingRemindersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming reminders</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{schedule.medication_name}</p>
                  <p className="text-sm text-muted-foreground">{schedule.dosage}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {schedule.time_of_day.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
