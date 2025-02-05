import { useState } from "react";
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

interface CheckInManagerProps {
  groupId: string;
}

export const CheckInManager = ({ groupId }: CheckInManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const { toast } = useToast();

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
          <CheckInHistory groupId={groupId} />
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