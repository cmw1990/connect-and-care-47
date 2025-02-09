
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface MedicationScheduleFormProps {
  groupId: string;
  onClose: () => void;
}

export const MedicationScheduleForm = ({ groupId, onClose }: MedicationScheduleFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      medication_name: "",
      dosage: "",
      frequency: "daily",
      time_of_day: [],
      instructions: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error: scheduleError } = await supabase
        .from('medication_schedules')
        .insert([{
          group_id: groupId,
          ...data,
          time_of_day: Array.isArray(data.time_of_day) 
            ? data.time_of_day 
            : [data.time_of_day]
        }]);

      if (scheduleError) throw scheduleError;

      toast({
        title: "Success",
        description: "Medication schedule created successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create medication schedule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Add Medication Schedule</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="medication_name">Medication Name</Label>
          <Input
            id="medication_name"
            {...register("medication_name", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            {...register("dosage", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            onValueChange={(value) => register("frequency").onChange({ target: { value } })}
            defaultValue="daily"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time_of_day">Time of Day</Label>
          <Input
            id="time_of_day"
            type="time"
            {...register("time_of_day", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            {...register("start_date", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            type="date"
            {...register("end_date")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          {...register("instructions")}
          placeholder="Enter any special instructions..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Schedule"}
        </Button>
      </div>
    </form>
  );
};
