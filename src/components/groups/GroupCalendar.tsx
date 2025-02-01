import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
}

interface GroupCalendarProps {
  groupId: string;
}

export const GroupCalendar = ({ groupId }: GroupCalendarProps) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, status")
        .eq("group_id", groupId)
        .not("due_date", "is", null);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, [groupId]);

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Function to modify day content
  const modifyDay = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length > 0) {
      return (
        <div className="relative">
          <div>{date.getDate()}</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>
        </div>
      );
    }
    return date.getDate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => modifyDay(date),
          }}
        />
        {date && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Tasks for {date.toLocaleDateString()}</h3>
            {getTasksForDate(date).map((task) => (
              <div
                key={task.id}
                className="p-2 rounded-lg border flex items-center justify-between"
              >
                <span className="text-sm">{task.title}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};