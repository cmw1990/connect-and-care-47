
import { Label } from "@/components/ui/label";

interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface WeeklyAvailabilityProps {
  availability: Availability[] | null;
}

export function WeeklyAvailability({ availability }: WeeklyAvailabilityProps) {
  if (!availability) return null;

  return (
    <div className="space-y-2">
      <Label>Caregiver Availability</Label>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
          const dayAvailability = availability.filter(a => a.day_of_week === index);
          return (
            <div key={day} className="text-center p-2 border rounded-md">
              <div className="font-medium">{day}</div>
              <div className="text-sm text-gray-500">
                {dayAvailability.length > 0 ? (
                  dayAvailability.map((a, i) => (
                    <div key={i}>
                      {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                    </div>
                  ))
                ) : (
                  <div>Unavailable</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
