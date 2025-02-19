
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

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
    },
    enabled: !!session
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

  // Show landing page for non-authenticated users
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 text-center">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Your Comprehensive Care Management Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline care coordination, manage medications, and stay connected with your care team - all in one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 max-w-5xl w-full">
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Care Coordination</h3>
            <p className="text-sm text-muted-foreground">
              Seamlessly coordinate care activities with family members and professional caregivers.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Medication Management</h3>
            <p className="text-sm text-muted-foreground">
              Track medications, set reminders, and maintain accurate records of administration.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Health Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Monitor vital signs, track symptoms, and share updates with healthcare providers.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/care-guides')}>
            Learn More
          </Button>
        </div>
      </div>
    );
  }

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
