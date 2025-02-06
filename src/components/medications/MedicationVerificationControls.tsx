
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MedicationVerificationControlsProps {
  verificationId: string;
  currentStatus: string | null;
}

export const MedicationVerificationControls = ({
  verificationId,
  currentStatus,
}: MedicationVerificationControlsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateVerificationStatus = async (status: 'verified' | 'rejected') => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('medication_verifications')
        .update({ status })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification ${status} successfully`,
      });
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
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => updateVerificationStatus('rejected')}
        disabled={isUpdating}
      >
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};
