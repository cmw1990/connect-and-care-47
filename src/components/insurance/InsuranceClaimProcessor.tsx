
import { useState } from "react";
import { useInsuranceCoverage } from "@/hooks/use-insurance-coverage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

interface InsuranceClaimProcessorProps {
  serviceType: string;
  amount: number;
  providerId?: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export const InsuranceClaimProcessor = ({
  serviceType,
  amount,
  providerId,
  onSuccess,
  children
}: InsuranceClaimProcessorProps) => {
  const { coverageInfo, isLoading } = useInsuranceCoverage(serviceType);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleClaimSubmission = async () => {
    if (!coverageInfo?.insuranceId || !coverageInfo?.userId) return;
    
    setProcessing(true);
    try {
      const claimData = {
        user_id: coverageInfo.userId,
        insurance_id: coverageInfo.insuranceId,
        service_type: serviceType,
        service_date: new Date().toISOString(),
        provider_id: providerId,
        claim_amount: amount,
        status: 'pending',
        processing_notes: []
      };

      const { error } = await supabase
        .from('insurance_claims')
        .insert(claimData);

      if (error) throw error;

      toast({
        title: "Claim submitted successfully",
        description: coverageInfo.canAutoProcess 
          ? "Your claim is being processed automatically."
          : "We'll handle the claim processing for you.",
        variant: "default",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error submitting claim",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">{children}</div>;
  }

  if (!coverageInfo?.isInsured) {
    return children;
  }

  if (coverageInfo.isCovered) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Insurance Coverage Available</CardTitle>
          </div>
          <CardDescription>
            This service is covered by your insurance plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>We'll handle the claim process automatically</span>
            </div>
            {children}
            <Button 
              onClick={handleClaimSubmission}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : "Proceed with Insurance Coverage"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Insurance Status</CardTitle>
        </div>
        <CardDescription>
          This service may not be covered by your current plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
