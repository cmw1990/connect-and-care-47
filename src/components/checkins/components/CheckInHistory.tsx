import { format } from "date-fns";
import { Clock, AlertTriangle, Activity } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type PatientCheckIn = Tables<"patient_check_ins">;

interface CheckInHistoryProps {
  checkIns: PatientCheckIn[];
  loading: boolean;
  groupId: string;
}

export const CheckInHistory = ({ checkIns, loading, groupId }: CheckInHistoryProps) => {
  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (checkIns.length === 0) {
    return <p className="text-gray-500 text-center">No recent check-ins</p>;
  }

  return (
    <div className="space-y-2">
      {checkIns.map((checkIn) => (
        <div
          key={checkIn.id}
          className="p-3 border rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            {checkIn.check_in_type === 'daily' ? (
              <Clock className="h-4 w-4 mr-2" />
            ) : checkIn.check_in_type === 'emergency' ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            <div>
              <p className="font-medium">
                {checkIn.check_in_type.charAt(0).toUpperCase() +
                  checkIn.check_in_type.slice(1)}{' '}
                Check-in
              </p>
              <p className="text-sm text-gray-500">
                {format(
                  new Date(checkIn.created_at),
                  'MMM d, yyyy h:mm a'
                )}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              checkIn.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : checkIn.status === 'urgent'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {checkIn.status.charAt(0).toUpperCase() +
              checkIn.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
};