import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GroupStatusBarProps {
  groupId: string;
  initialStatus?: string;
}

const statusColors = {
  normal: "bg-[#F2FCE2]",
  warning: "bg-[#FEF7CD]",
  urgent: "bg-[#F97316]",
  emergency: "bg-[#ea384c]",
};

const statusMessages = {
  normal: "Everything is fine",
  warning: "Attention needed",
  urgent: "Urgent situation",
  emergency: "Emergency - Immediate action required",
};

export const GroupStatusBar = ({ groupId, initialStatus = "normal" }: GroupStatusBarProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [showAlert, setShowAlert] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowAlert(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      const { error } = await supabase
        .from('care_groups')
        .update({ 
          privacy_settings: {
            status: pendingStatus,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', groupId);

      if (error) throw error;

      setStatus(pendingStatus);
      toast({
        title: "Status Updated",
        description: `Group status has been updated to ${pendingStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update group status",
        variant: "destructive",
      });
    }

    setShowAlert(false);
    setPendingStatus(null);
  };

  return (
    <>
      <div className={`p-4 rounded-lg ${statusColors[status as keyof typeof statusColors]} transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Group Status:</span>
            <span>{statusMessages[status as keyof typeof statusMessages]}</span>
          </div>
          <Select onValueChange={handleStatusChange} value={status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing the group status will notify all group members. This should only be used to inform members about emergency situations or important updates regarding the patient's condition.
              
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Yes, change status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};