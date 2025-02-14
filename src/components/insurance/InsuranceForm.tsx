
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceFormProps {
  onSuccess?: () => void;
}

export const InsuranceForm = ({ onSuccess }: InsuranceFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insuranceData, setInsuranceData] = useState({
    type: "",
    provider: "",
    policyNumber: "",
    groupNumber: "",
    coverageStartDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('user_insurance').insert({
        user_id: user.id,
        policy_number: insuranceData.policyNumber,
        group_number: insuranceData.groupNumber,
        coverage_start_date: insuranceData.coverageStartDate,
        verification_status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Insurance information submitted",
        description: "Your insurance details are being verified. We'll notify you once verified.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting insurance:', error);
      toast({
        title: "Error",
        description: "Failed to submit insurance information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>
          Add your insurance details for coverage verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label>Insurance Type</label>
            <Select
              value={insuranceData.type}
              onValueChange={(value) => setInsuranceData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medicare">Medicare</SelectItem>
                <SelectItem value="medicaid">Medicaid</SelectItem>
                <SelectItem value="private">Private Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Insurance Provider</label>
            <Input
              placeholder="Enter provider name"
              value={insuranceData.provider}
              onChange={(e) => setInsuranceData(prev => ({ ...prev, provider: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label>Policy Number</label>
            <Input
              placeholder="Enter policy number"
              value={insuranceData.policyNumber}
              onChange={(e) => setInsuranceData(prev => ({ ...prev, policyNumber: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label>Group Number (if applicable)</label>
            <Input
              placeholder="Enter group number"
              value={insuranceData.groupNumber}
              onChange={(e) => setInsuranceData(prev => ({ ...prev, groupNumber: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label>Coverage Start Date</label>
            <Input
              type="date"
              value={insuranceData.coverageStartDate}
              onChange={(e) => setInsuranceData(prev => ({ ...prev, coverageStartDate: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Insurance Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
