import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StaffSchedule {
  id: string;
  staff_id: string;
  shift_start: string;
  shift_end: string;
  shift_type: string;
  department: string;
  status: string;
  staff: {
    first_name: string;
    last_name: string;
  };
}

export const StaffSchedule = ({ facilityId }: { facilityId: string }) => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['staff-schedules', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_home_staff_schedule')
        .select(`
          id,
          staff_id,
          shift_start,
          shift_end,
          shift_type,
          department,
          status,
          staff:profiles(first_name, last_name)
        `)
        .eq('facility_id', facilityId)
        .gte('shift_start', new Date().toISOString())
        .order('shift_start', { ascending: true });

      if (error) throw error;
      return data as StaffSchedule[];
    },
  });

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Staff Schedule</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules?.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {schedule.staff.first_name} {schedule.staff.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {schedule.department} - {schedule.shift_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {new Date(schedule.shift_start).toLocaleTimeString()} -{" "}
                  {new Date(schedule.shift_end).toLocaleTimeString()}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    schedule.status === "scheduled"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {schedule.status}
                </span>
              </div>
            </div>
          ))}
          <Button className="w-full">Add Shift</Button>
        </div>
      </CardContent>
    </Card>
  );
};