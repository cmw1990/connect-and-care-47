
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock, DollarSign, FileText, Search, Users } from "lucide-react";
import { InsuranceCard } from "./InsuranceCard";
import { InsuranceClaimsList } from "./InsuranceClaimsList";
import { InsuranceProviderSearch } from "./InsuranceProviderSearch";
import { InsuranceDocumentUpload } from "./InsuranceDocumentUpload";
import { useToast } from "@/hooks/use-toast";

interface InsuranceDashboardProps {
  userId?: string;
}

export const InsuranceDashboard = ({ userId }: InsuranceDashboardProps) => {
  const { toast } = useToast();
  const [activeInsuranceId, setActiveInsuranceId] = useState<string>();

  // Fetch user's insurance information
  const { data: insurances, isLoading: isLoadingInsurance } = useQuery({
    queryKey: ['userInsurance'],
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
            type,
            coverage_details
          ),
          benefit_usage (
            used_amount,
            year
          )
        `)
        .eq('user_id', userId || user.id);

      if (error) throw error;
      return data;
    }
  });

  // Fetch recent claims
  const { data: recentClaims } = useQuery({
    queryKey: ['recentClaims', activeInsuranceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('insurance_id', activeInsuranceId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!activeInsuranceId
  });

  // Set first insurance as active if not set
  if (insurances?.length && !activeInsuranceId) {
    setActiveInsuranceId(insurances[0].id);
  }

  const activeInsurance = insurances?.find(ins => ins.id === activeInsuranceId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentClaims?.filter(claim => claim.status === 'processing').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentClaims?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${recentClaims?.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {activeInsurance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Insurance Coverage</CardTitle>
              <CardDescription>Your current insurance plan and coverage details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <InsuranceCard insurance={activeInsurance} />
                <div className="mt-4 space-y-4">
                  <h4 className="font-semibold">Coverage Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(activeInsurance.insurance_plan.coverage_details || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        {value ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Status of your recent insurance claims</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {recentClaims?.map(claim => (
                    <div key={claim.id} className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{claim.service_type}</p>
                        <p className="text-sm text-muted-foreground">
                          ${claim.claim_amount}
                        </p>
                      </div>
                      <Badge
                        variant={
                          claim.status === 'approved' 
                            ? 'default' 
                            : claim.status === 'denied' 
                            ? 'destructive' 
                            : 'secondary'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="claims" className="space-y-4">
          <InsuranceClaimsList />
        </TabsContent>
        <TabsContent value="providers" className="space-y-4">
          <InsuranceProviderSearch />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          {activeInsuranceId && (
            <InsuranceDocumentUpload
              insuranceId={activeInsuranceId}
              documentType="insurance_card"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
