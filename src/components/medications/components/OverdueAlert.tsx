
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverdueAlertProps {
  overdueCount: number;
}

export const OverdueAlert = ({ overdueCount }: OverdueAlertProps) => {
  if (overdueCount === 0) return null;
  
  return (
    <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <span>You have {overdueCount} overdue medication{overdueCount > 1 ? 's' : ''}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {}}
        className="hover:scale-105 transition-transform"
      >
        View Details
      </Button>
    </div>
  );
};
