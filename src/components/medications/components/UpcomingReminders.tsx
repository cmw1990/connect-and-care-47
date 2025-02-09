
import { BellRing, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Schedule {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
}

interface UpcomingRemindersProps {
  schedules: Schedule[];
}

export const UpcomingReminders = ({ schedules }: UpcomingRemindersProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4" />
          Upcoming Reminders
        </h4>

        <div className="space-y-4">
          {!schedules?.length ? (
            <p className="text-muted-foreground text-center py-4">
              No upcoming medication reminders
            </p>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between pb-4 border-b last:border-0 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
              >
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {schedule.medication_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {schedule.dosage}
                  </p>
                </div>
                <div className="text-sm text-right">
                  {schedule.time_of_day.map((time: string) => (
                    <div key={time} className="flex items-center gap-2">
                      <BellRing className="h-4 w-4" />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
