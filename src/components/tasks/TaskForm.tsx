
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Plus, Tag, X } from "lucide-react";

interface TaskFormProps {
  groupId: string;
  onTaskCreated: () => void;
}

export const TaskForm = ({ groupId, onTaskCreated }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const { toast } = useToast();

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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

      const taskData = {
        title,
        due_date: date.toISOString(),
        group_id: groupId,
        status: "pending",
        priority: "normal",
        description,
        recurring: isRecurring,
        recurrence_pattern: isRecurring ? { type: "weekly" } : { type: "none" },
        tags,
        reminder_time: reminderTime ? new Date(date.setHours(
          parseInt(reminderTime.split(":")[0]),
          parseInt(reminderTime.split(":")[1])
        )).toISOString() : null,
      };

      const { error } = await supabase.from("tasks").insert(taskData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task scheduled successfully",
      });

      // Reset form
      setTitle("");
      setDate(undefined);
      setDescription("");
      setIsRecurring(false);
      setTags([]);
      setCurrentTag("");
      setReminderTime("");
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
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder">Reminder Time</Label>
        <Input
          id="reminder"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Recurring Task</Label>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTag}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
            >
              <Tag className="h-3 w-3" />
              <span className="text-sm">{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-primary hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

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
