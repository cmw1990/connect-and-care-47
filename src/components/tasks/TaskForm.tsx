
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormProps {
  groupId: string;
  onTaskCreated: () => void;
}

export const TaskForm = ({ groupId, onTaskCreated }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleScheduleTask = async () => {
    try {
      if (!title || !date) {
        toast({
          title: "Missing Information",
          description: "Please provide both title and date",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("tasks").insert({
        title,
        due_date: date.toISOString(),
        group_id: groupId,
        status: "pending",
        priority: "normal",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task scheduled successfully",
      });

      setTitle("");
      setDate(undefined);
      onTaskCreated();
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast({
        title: "Error",
        description: "Failed to schedule task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <Button 
        onClick={handleScheduleTask}
        className="w-full"
        disabled={!title || !date}
      >
        Schedule Task
      </Button>
    </div>
  );
};
