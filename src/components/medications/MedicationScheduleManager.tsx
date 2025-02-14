import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Clock, Pill } from "lucide-react";
import { MedicationScheduleForm } from "./MedicationScheduleForm";
import { format } from "date-fns";

interface MedicationScheduleManagerProps {
  groupId: string;
}

export const MedicationScheduleManager = ({ groupId }: MedicationScheduleManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['medicationSchedules', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_schedules')
        .select(`
          *,
          medication_supervision (
            id,
            supervisor_id,
            supervision_level,
            supervisor:profiles!medication_supervision_supervisor_id_fkey (
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medication Schedules</h3>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {showAddForm && (
        <MedicationScheduleForm 
          groupId={groupId} 
          onClose={() => setShowAddForm(false)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {schedules?.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    {schedule.medication_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {schedule.dosage} - {schedule.instructions}
                  </p>
                </div>
                <div className="text-sm text-right">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(schedule.start_date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    {schedule.time_of_day.join(', ')}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <h5 className="font-medium mb-2">Supervisors:</h5>
                <div className="space-y-1">
                  {schedule.medication_supervision?.map((supervisor: any) => (
                    <div key={supervisor.supervisor_id} className="flex items-center justify-between">
                      <span>
                        {supervisor.supervisor.first_name} {supervisor.supervisor.last_name}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {supervisor.supervision_level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
