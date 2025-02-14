
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

export const InsuranceAnalytics = () => {
  const { data: claimsAnalytics } = useQuery({
    queryKey: ['claimsAnalytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: claims, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process claims data for analytics
      const monthlyData = claims.reduce((acc: any[], claim) => {
        const month = format(new Date(claim.created_at), 'MMM yyyy');
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          existing.totalAmount += claim.claim_amount;
          existing.count += 1;
          if (claim.status === 'approved') existing.approved += 1;
        } else {
          acc.push({
            month,
            totalAmount: claim.claim_amount,
            count: 1,
            approved: claim.status === 'approved' ? 1 : 0
          });
        }
        
        return acc;
      }, []);

      const approvalRate = claims.length > 0 
        ? (claims.filter(c => c.status === 'approved').length / claims.length * 100).toFixed(1)
        : 0;

      const totalClaimed = claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
      
      return {
        monthlyData,
        approvalRate,
        totalClaimed,
        totalClaims: claims.length
      };
    }
  });

  if (!claimsAnalytics) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimsAnalytics.totalClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimsAnalytics.approvalRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${claimsAnalytics.totalClaimed.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Claims History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={claimsAnalytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="totalAmount" 
                stroke="#2563eb" 
                name="Claim Amount ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
