
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface InsuranceAnalyticsDashboardProps {
  userId: string;
}

export const InsuranceAnalyticsDashboard = ({ userId }: InsuranceAnalyticsDashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");
  const [chartType, setChartType] = useState("claims");

  const { data: analyticsData } = useQuery({
    queryKey: ['insurance-analytics', userId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: trendsData } = useQuery({
    queryKey: ['insurance-trends', userId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const processedData = trendsData?.map(claim => ({
    date: format(new Date(claim.created_at), 'MMM dd'),
    amount: claim.claim_amount,
    status: claim.status
  })) || [];

  const downloadReport = async () => {
    try {
      const reportData = {
        analytics: analyticsData,
        trends: trendsData,
        generatedAt: new Date().toISOString(),
        userId
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insurance-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t("Report Downloaded"),
        description: t("Your insurance analytics report has been downloaded successfully."),
      });
    } catch (error) {
      toast({
        title: t("Download Failed"),
        description: t("Failed to download report. Please try again."),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("Insurance Analytics")}</h2>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Select time range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("Last 7 days")}</SelectItem>
              <SelectItem value="30">{t("Last 30 days")}</SelectItem>
              <SelectItem value="90">{t("Last 90 days")}</SelectItem>
              <SelectItem value="365">{t("Last year")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("Download Report")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("Total Claims")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trendsData?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Approved Claims")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {trendsData?.filter(claim => claim.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Pending Claims")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {trendsData?.filter(claim => claim.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Total Amount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${trendsData?.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Claims Trend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  name={t("Claim Amount")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
