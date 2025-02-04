import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";

interface CheckInActionsProps {
  onScheduleCheckIn: () => void;
  onEmergencyAlert: () => void;
  isDailyCheckInEnabled: boolean;
}

export const CheckInActions = ({ 
  onScheduleCheckIn, 
  onEmergencyAlert,
  isDailyCheckInEnabled 
}: CheckInActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        className="flex items-center"
        onClick={onScheduleCheckIn}
        disabled={!isDailyCheckInEnabled}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Check-in
      </Button>
      <Button
        variant="destructive"
        className="flex items-center"
        onClick={onEmergencyAlert}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Emergency Alert
      </Button>
    </div>
  );
};