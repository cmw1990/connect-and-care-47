
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MedicationVerificationControlsProps {
  verificationId: string;
  currentStatus: string | null;
}

export const MedicationVerificationControls = ({
  verificationId,
  currentStatus,
}: MedicationVerificationControlsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  const updateVerificationStatus = async (status: 'verified' | 'rejected') => {
    try {
      setIsUpdating(true);
      const updateData: any = { 
        status,
        verified_at: status === 'verified' ? new Date().toISOString() : null
      };
      
      if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('medication_verifications')
        .update(updateData)
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification ${status} successfully`,
      });
      
      if (status === 'rejected') {
        setShowRejectDialog(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus !== 'pending') return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 hover:text-green-700"
        onClick={() => updateVerificationStatus('verified')}
        disabled={isUpdating}
      >
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>
      
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            disabled={isUpdating}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this verification..."
              />
            </div>
            <Button 
              className="w-full"
              onClick={() => updateVerificationStatus('rejected')}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
