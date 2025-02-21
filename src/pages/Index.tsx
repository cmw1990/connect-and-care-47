import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Search, Scale, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { HealthDashboard } from "@/components/health/health-dashboard";
import { CareCalendar } from "@/components/care/care-calendar";
import { SecureChat } from "@/components/communication/secure-chat";
import { Calendar } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-600">Care Companion</div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/care-guides')}>
                Resources
              </Button>
              <Button variant="ghost" onClick={() => navigate('/about')}>
                About
              </Button>
              <Button variant="default" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="py-20 text-center space-y-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                Your All-in-One{' '}
                <span className="text-primary-600">Care Connection</span> Platform
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Connect with caregivers, coordinate care, and support your loved ones - all in one secure platform.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8"
              >
                Start Your Care Journey
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/care-guides')}
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                Explore Features
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Better Care
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Discover how Care Companion makes caregiving easier and more effective
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <Search className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Find Care</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Connect with qualified caregivers who match your specific needs and preferences.
                </p>
                <Button variant="link" onClick={() => navigate('/caregivers')} className="text-primary-600 p-0">
                  Learn More →
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Compare Care</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Make informed decisions by comparing care options, services, and facilities.
                </p>
                <Button variant="link" onClick={() => navigate('/compare')} className="text-primary-600 p-0">
                  Start Comparing →
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <Users2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Coordinate Care</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Efficiently manage care schedules, tasks, and communication between family members.
                </p>
                <Button variant="link" onClick={() => navigate('/features')} className="text-primary-600 p-0">
                  View Features →
                </Button>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by Families
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                See how Care Companion is making a difference in people's lives
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Family Caregiver</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "Care Companion has made it so much easier to coordinate care for my mother. The ability to track medications and appointments in one place is invaluable."
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20">
            <div className="bg-primary-600 rounded-3xl p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Your Care Journey?
              </h2>
              <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of families who are already using Care Companion to provide better care for their loved ones.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Care Companion</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Making caregiving easier, one family at a time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Find Care</li>
                  <li>Compare Options</li>
                  <li>Coordinate Care</li>
                  <li>Health Tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Care Guides</li>
                  <li>Blog</li>
                  <li>Support Center</li>
                  <li>Contact Us</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Cookie Policy</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-sm text-gray-600 dark:text-gray-300">
              {new Date().getFullYear()} Care Companion. All rights reserved.
            </div>
          </div>
        </footer>
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

  // Show authenticated user dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 space-y-8">
        <DashboardHeader />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                <Users2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Schedule a Visit</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Schedule a visit with your caregiver.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Track Medication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your medication and receive reminders.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Message Caregiver</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send a message to your caregiver.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">View Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View your care reports and track your progress.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Health Dashboard */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <HealthDashboard />
            </div>

            {/* Care Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <CareCalendar />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Secure Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <SecureChat />
            </div>

            {/* Care Updates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Care Updates</h3>
                  <Button variant="outline" size="sm" className="text-primary-600 border-primary-600">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments?.map((appointment) => (
                    <div key={appointment.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{appointment.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(appointment.scheduled_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
