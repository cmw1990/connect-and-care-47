import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import type { Availability } from "@/types/roles";

export const CareTeamCalendar = ({ groupId }: { groupId: string }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [newAvailability, setNewAvailability] = useState({
    available_days: [] as string[],
    available_hours: {
      start: "09:00",
      end: "17:00",
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailabilities();
  }, [groupId]);

  const fetchAvailabilities = async () => {
    try {
      const { data, error } = await supabase
        .from("care_team_availability")
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        available_hours: typeof item.available_hours === 'string' 
          ? JSON.parse(item.available_hours)
          : item.available_hours
      }));
      
      setAvailabilities(transformedData as Availability[]);
    } catch (error) {
      console.error("Error fetching availabilities:", error);
      toast({
        title: "Error",
        description: "Failed to load care team availabilities",
        variant: "destructive",
      });
    }
  };

  const handleCreateAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("care_team_availability").insert({
        group_id: groupId,
        user_id: user.id,
        available_days: newAvailability.available_days,
        available_hours: newAvailability.available_hours,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability schedule created successfully",
      });
      
      fetchAvailabilities();
    } catch (error) {
      console.error("Error creating availability:", error);
      toast({
        title: "Error",
        description: "Failed to create availability schedule",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Care Team Calendar
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Set Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Your Availability</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Days</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <Button
                          key={day}
                          variant={
                            newAvailability.available_days.includes(day)
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setNewAvailability({
                              ...newAvailability,
                              available_days:
                                newAvailability.available_days.includes(day)
                                  ? newAvailability.available_days.filter(
                                      (d) => d !== day
                                    )
                                  : [...newAvailability.available_days, day],
                            })
                          }
                        >
                          {day}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={newAvailability.available_hours.start}
                      onChange={(e) =>
                        setNewAvailability({
                          ...newAvailability,
                          available_hours: {
                            ...newAvailability.available_hours,
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={newAvailability.available_hours.end}
                      onChange={(e) =>
                        setNewAvailability({
                          ...newAvailability,
                          available_hours: {
                            ...newAvailability.available_hours,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleCreateAvailability} className="w-full">
                  Save Availability
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <div className="space-y-4">
            <h3 className="font-medium">Team Availability</h3>
            {availabilities.map((availability) => (
              <div
                key={availability.id}
                className="p-4 rounded-lg border space-y-2"
              >
                <p className="font-medium">
                  {availability.profiles?.first_name}{" "}
                  {availability.profiles?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Days: {availability.available_days.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Hours: {availability.available_hours.start} -{" "}
                  {availability.available_hours.end}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
