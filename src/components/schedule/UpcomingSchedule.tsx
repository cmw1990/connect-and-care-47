import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UpcomingSchedule = () => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['upcoming-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_schedule')
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          care_groups (
            name
          )
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : schedules?.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No upcoming schedules
          </p>
        ) : (
          <div className="space-y-4">
            {schedules?.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{schedule.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {schedule.care_groups?.name}
                  </p>
                  {schedule.description && (
                    <p className="text-sm mt-1">{schedule.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(schedule.start_time), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};