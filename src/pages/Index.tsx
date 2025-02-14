import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Index() {
  const { data: primaryGroup, isLoading: loadingGroup, error } = useQuery({
    queryKey: ['primaryGroup'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('care_groups')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: upcomingAppointments } = useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!primaryGroup
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard data</AlertDescription>
      </Alert>
    );
  }

  if (loadingGroup) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        notifications={[]} // We'll implement notifications later
        groupId={primaryGroup?.id}
      />
      <DashboardContent
        primaryGroup={primaryGroup}
        upcomingAppointments={upcomingAppointments}
      />
    </div>
  );
}
