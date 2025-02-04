import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CareHomeStaffSchedule } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const StaffSchedule = ({ facilityId }: { facilityId: string }) => {
  const [schedules, setSchedules] = useState<CareHomeStaffSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('care_home_staff_schedule')
          .select('*')
          .eq('facility_id', facilityId)
          .order('shift_start', { ascending: true });

        if (error) throw error;

        // Ensure type safety by mapping the response
        const typedSchedules: CareHomeStaffSchedule[] = data.map(item => ({
          id: item.id,
          facility_id: item.facility_id,
          staff_id: item.staff_id,
          shift_start: item.shift_start,
          shift_end: item.shift_end,
          shift_type: item.shift_type,
          department: item.department,
          status: item.status,
          notes: item.notes
        }));

        setSchedules(typedSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load staff schedules",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [facilityId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No schedules available</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{schedule.department}</h3>
                        <p className="text-sm text-gray-500">{schedule.shift_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(schedule.shift_start).toLocaleTimeString()} - 
                          {new Date(schedule.shift_end).toLocaleTimeString()}
                        </p>
                        <p className={`text-sm ${
                          schedule.status === 'scheduled' 
                            ? 'text-green-500' 
                            : 'text-yellow-500'
                        }`}>
                          {schedule.status}
                        </p>
                      </div>
                    </div>
                    {schedule.notes && (
                      <p className="mt-2 text-sm text-gray-500">{schedule.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};