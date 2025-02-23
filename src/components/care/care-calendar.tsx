
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function CareCalendar() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Care Calendar</h3>
      </div>
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">Upcoming Appointments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No upcoming appointments scheduled.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
