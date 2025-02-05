import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { CheckInForm } from "./components/CheckInForm";
import { CheckInHistory } from "./components/CheckInHistory";
import { NoActiveCheckIn } from "./components/NoActiveCheckIn";
import { Tables } from "@/integrations/supabase/types";

interface CheckInManagerProps {
  groupId: string;
}

type PatientCheckIn = Tables<"patient_check_ins">;

export const CheckInManager = ({ groupId }: CheckInManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [checkIns, setCheckIns] = useState<PatientCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCheckIns();
  }, [groupId]);

  const fetchCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_check_ins')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast({
        title: "Error",
        description: "Failed to load check-ins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("patient_check_ins")
        .insert({
          group_id: groupId,
          ...data,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check-in submitted successfully",
      });
      setIsDialogOpen(false);
      fetchCheckIns(); // Refresh the list after submission
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast({
        title: "Error",
        description: "Failed to submit check-in",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCheckIn ? (
          <CheckInHistory groupId={groupId} checkIns={checkIns} loading={loading} />
        ) : (
          <NoActiveCheckIn onCheckIn={() => setIsDialogOpen(true)} />
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Check-in</DialogTitle>
            </DialogHeader>
            <CheckInForm onSubmit={handleCheckInSubmit} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};