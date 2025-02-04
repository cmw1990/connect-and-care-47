import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, List, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CareRoutineManagerProps {
  groupId: string;
}

export const CareRoutineManager = ({ groupId }: CareRoutineManagerProps) => {
  const [routines, setRoutines] = useState<any[]>([]);
  const [newRoutine, setNewRoutine] = useState({ title: "", description: "", frequency: "daily" });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutines();
  }, [groupId]);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('care_routines')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };

  const addRoutine = async () => {
    try {
      const { error } = await supabase
        .from('care_routines')
        .insert({
          group_id: groupId,
          title: newRoutine.title,
          description: newRoutine.description,
          frequency: newRoutine.frequency,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Care routine added successfully",
      });

      setNewRoutine({ title: "", description: "", frequency: "daily" });
      fetchRoutines();
    } catch (error) {
      console.error('Error adding routine:', error);
      toast({
        title: "Error",
        description: "Failed to add care routine",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Care Routines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Routine Title</Label>
              <Input
                id="title"
                value={newRoutine.title}
                onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                placeholder="Enter routine title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newRoutine.description}
                onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
                placeholder="Enter routine description"
              />
            </div>
            <Button onClick={addRoutine} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Routine
            </Button>
          </div>

          <div className="space-y-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">{routine.title}</h3>
                  <p className="text-sm text-gray-500">{routine.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{routine.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};