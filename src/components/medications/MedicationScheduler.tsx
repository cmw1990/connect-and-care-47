import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Clock, Pill } from "lucide-react";
import type { MedicationSchedule } from "@/types/roles";

export const MedicationScheduler = ({ groupId }: { groupId: string }) => {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<MedicationSchedule>({
    id: "",
    medication_name: "",
    dosage: "",
    frequency: "daily", // Set a default value
    time_of_day: [],
    instructions: "",
    start_date: new Date().toISOString(),
    end_date: null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicationSchedules();
  }, [groupId]);

  const fetchMedicationSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("medication_schedules")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching medication schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load medication schedules",
        variant: "destructive",
      });
    }
  };

  const handleCreateSchedule = async () => {
    try {
      // Ensure required fields are present
      if (!newSchedule.medication_name || !newSchedule.frequency) {
        toast({
          title: "Error",
          description: "Medication name and frequency are required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("medication_schedules").insert({
        medication_name: newSchedule.medication_name,
        dosage: newSchedule.dosage,
        frequency: newSchedule.frequency,
        time_of_day: newSchedule.time_of_day,
        instructions: newSchedule.instructions,
        start_date: newSchedule.start_date,
        end_date: newSchedule.end_date,
        group_id: groupId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication schedule created successfully",
      });
      
      fetchMedicationSchedules();
      setNewSchedule({
        id: "",
        medication_name: "",
        dosage: "",
        frequency: "daily",
        time_of_day: [],
        instructions: "",
        start_date: new Date().toISOString(),
        end_date: null
      });
    } catch (error) {
      console.error("Error creating medication schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create medication schedule",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Schedule
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medication Schedule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medication_name">Medication Name</Label>
                  <Input
                    id="medication_name"
                    value={newSchedule.medication_name}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        medication_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newSchedule.dosage}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, dosage: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={newSchedule.frequency}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, frequency: e.target.value })
                    }
                    placeholder="e.g., Daily, Twice daily"
                  />
                </div>
                <div>
                  <Label htmlFor="time_of_day">Time of Day</Label>
                  <Input
                    id="time_of_day"
                    type="time"
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        time_of_day: [...(newSchedule.time_of_day || []), e.target.value],
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newSchedule.instructions}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleCreateSchedule} className="w-full">
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{schedule.medication_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {schedule.dosage} - {schedule.frequency}
                </p>
                <p className="text-sm text-muted-foreground">
                  Times: {schedule.time_of_day.join(", ")}
                </p>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
