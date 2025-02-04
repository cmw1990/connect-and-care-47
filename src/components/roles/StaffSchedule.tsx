import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CareHomeStaffSchedule } from "@/types/care-home";
import { useToast } from "@/hooks/use-toast";

export const StaffSchedule = ({ facilityId }: { facilityId: string }) => {
  const [schedules, setSchedules] = useState<CareHomeStaffSchedule[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('care_home_staff_schedule')
          .select(`
            *,
            profiles:staff_id (
              first_name,
              last_name
            )
          `)
          .eq('facility_id', facilityId)
          .order('shift_start', { ascending: true });

        if (error) throw error;
        setSchedules(data as CareHomeStaffSchedule[]);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load staff schedules",
          variant: "destructive",
        });
      }
    };

    fetchSchedules();
  }, [facilityId, toast]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {(schedule as any).profiles?.first_name} {(schedule as any).profiles?.last_name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        schedule.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{new Date(schedule.shift_start).toLocaleString()} - {new Date(schedule.shift_end).toLocaleString()}</p>
                      <p>{schedule.department} - {schedule.shift_type}</p>
                    </div>
                    {schedule.notes && (
                      <p className="text-sm text-gray-600">{schedule.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};