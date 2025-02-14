
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import type { InsuranceAnalytics } from "@/types/supabase";

interface InsuranceAnalyticsDashboardProps {
  userId: string;
}

export const InsuranceAnalyticsDashboard = ({ userId }: InsuranceAnalyticsDashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");

  const { data: analytics } = useQuery({
    queryKey: ['insurance-analytics', userId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_analytics')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const downloadReport = async () => {
    try {
      const reportData = {
        analytics,
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {analytics?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{t(item.type)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.type.includes('amount') ? `$${item.value.toFixed(2)}` : item.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.created_at), 'PPP')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
