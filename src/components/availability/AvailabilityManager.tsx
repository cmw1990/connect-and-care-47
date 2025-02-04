import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
}

export const AvailabilityManager = ({ profileId, profileType }: { profileId: string; profileType: string }) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [profileId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('profile_id', profileId)
        .eq('profile_type', profileType);

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSlot = async (newSlot: Omit<TimeSlot, 'id'>) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .insert({
          ...newSlot,
          profile_id: profileId,
          profile_type: profileType,
        });

      if (error) throw error;
      await fetchAvailability();
      toast({
        title: "Success",
        description: "Availability slot added successfully",
      });
    } catch (error) {
      console.error('Error adding slot:', error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{slot.day_of_week}</p>
                  <p className="text-sm text-gray-500">
                    {slot.start_time} - {slot.end_time}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {/* Add delete functionality */}}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};