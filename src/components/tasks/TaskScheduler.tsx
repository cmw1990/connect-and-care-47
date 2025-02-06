
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock } from "lucide-react";

interface TaskSchedulerProps {
  groupId: string;
}

export const TaskScheduler = ({ groupId }: TaskSchedulerProps) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Schedule Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};
