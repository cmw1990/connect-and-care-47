import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

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
  const [date, setDate] = React.useState<Date>(new Date());
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    format(new Date(), "MMMM yyyy")
  );

  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return format(date, "MMMM yyyy");
  });

  const handleMonthSelect = (month: string) => {
    const [monthName, year] = month.split(" ");
    const newDate = new Date(parseInt(year), months.indexOf(monthName), 1);
    setDate(newDate);
    setSelectedMonth(month);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
          <Select value={selectedMonth} onValueChange={handleMonthSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center p-2 border rounded-lg"
            >
              <div className="text-sm font-medium mb-1">
                {format(day, "EEE")}
              </div>
              <div className="text-lg">{format(day, "d")}</div>
              <div className="mt-2 space-y-1">
                {getTasksForDate(day).map((task) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};