import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";
import { InsuranceDashboard } from "@/components/insurance/InsuranceDashboard";
import { InsuranceAnalytics } from "@/components/insurance/InsuranceAnalytics";
import { InsurancePlanBenefitsTable } from "@/components/insurance/InsurancePlanBenefitsTable";
import { InsuranceDeductiblesCard } from "@/components/insurance/InsuranceDeductiblesCard";
import { InsurancePreauthorizationForm } from "@/components/insurance/InsurancePreauthorizationForm";
import { InsuranceDocumentUpload } from "@/components/insurance/InsuranceDocumentUpload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Insurance = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: activeInsurance } = useQuery({
    queryKey: ['activeInsurance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (*)
        `)
        .eq('user_id', user.id)
        .eq('verification_status', 'verified')
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Management</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Insurance"}
        </Button>
      </div>

      {showForm ? (
        <InsuranceForm onSuccess={() => setShowForm(false)} />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="preauth">Pre-Authorization</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2">
              <InsuranceDashboard />
              {activeInsurance && (
                <InsuranceDeductiblesCard insuranceId={activeInsurance.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="benefits">
            {activeInsurance?.insurance_plan && (
              <InsurancePlanBenefitsTable planId={activeInsurance.insurance_plan.id} />
            )}
          </TabsContent>

          <TabsContent value="preauth">
            {activeInsurance && (
              <InsurancePreauthorizationForm insuranceId={activeInsurance.id} />
            )}
          </TabsContent>

          <TabsContent value="documents">
            {activeInsurance && (
              <InsuranceDocumentUpload
                insuranceId={activeInsurance.id}
                documentType="insurance_card"
              />
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <InsuranceAnalytics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Insurance;
