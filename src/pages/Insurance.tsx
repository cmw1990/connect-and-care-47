
import { useState } from "react";
import { InsuranceForm } from "@/components/insurance/InsuranceForm";
import { InsuranceList } from "@/components/insurance/InsuranceList";
import { InsuranceClaimsList } from "@/components/insurance/InsuranceClaimsList";
import { InsuranceVerificationHistory } from "@/components/insurance/InsuranceVerificationHistory";
import { InsuranceDocumentUpload } from "@/components/insurance/InsuranceDocumentUpload";
import { InsuranceProviderSearch } from "@/components/insurance/InsuranceProviderSearch";
import { InsuranceCard } from "@/components/insurance/InsuranceCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Insurance = () => {
  const [showForm, setShowForm] = useState(false);

  const { data: activeInsurance } = useQuery({
    queryKey: ['activeInsurance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_insurance')
        .select(`
          *,
          insurance_plan:insurance_plan_id (
            name,
            provider,
            type
          )
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
        <>
          {activeInsurance && (
            <div className="max-w-md mx-auto mb-8">
              <InsuranceCard insurance={activeInsurance} />
            </div>
          )}

          <Tabs defaultValue="coverage">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="coverage">
              <div className="space-y-6">
                <InsuranceList />
                <InsuranceVerificationHistory />
              </div>
            </TabsContent>

            <TabsContent value="claims">
              <InsuranceClaimsList />
            </TabsContent>

            <TabsContent value="documents">
              {activeInsurance && (
                <InsuranceDocumentUpload
                  insuranceId={activeInsurance.id}
                  documentType="insurance_card"
                />
              )}
            </TabsContent>

            <TabsContent value="providers">
              <InsuranceProviderSearch />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Insurance;
