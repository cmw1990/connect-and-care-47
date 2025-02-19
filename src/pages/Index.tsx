
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Search, Scale, Users2 } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Your All-in-One Care Connection Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with caregivers, compare care options, and coordinate care activities - all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary-600 hover:bg-primary-700">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/care-guides')}>
                Learn More
              </Button>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Care</h3>
              <p className="text-muted-foreground mb-4">
                Search and connect with qualified caregivers based on your specific needs and preferences.
              </p>
              <Button variant="link" onClick={() => navigate('/caregivers')} className="p-0">
                Find Caregivers →
              </Button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compare Care</h3>
              <p className="text-muted-foreground mb-4">
                Compare care homes, products, and services to make informed decisions for your care needs.
              </p>
              <Button variant="link" onClick={() => navigate('/compare')} className="p-0">
                Compare Options →
              </Button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users2 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Care Groups</h3>
              <p className="text-muted-foreground mb-4">
                Create and manage care groups to coordinate care activities with family members and caregivers.
              </p>
              <Button variant="link" onClick={() => navigate('/groups')} className="p-0">
                Learn About Groups →
              </Button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Platform?</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Simplified Care Coordination</h3>
                <p className="text-sm text-muted-foreground">
                  Streamline communication and tasks between family members and caregivers.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Smart Medication Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track medications, set reminders, and maintain accurate administration records.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Real-time Health Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor vital signs and track symptoms with easy-to-use tools.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Secure Communication</h3>
                <p className="text-sm text-muted-foreground">
                  Keep all care-related communications private and secure.
                </p>
              </div>
            </div>
          </div>
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
