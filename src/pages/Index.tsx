import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CareOverview } from "@/components/dashboard/CareOverview";
import { CareGuideExamples } from "@/components/dashboard/CareGuideExamples";
import { motion, AnimatePresence } from "framer-motion";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WellnessScore } from "@/components/dashboard/WellnessScore";
import { EmergencySOSButton } from "@/components/emergency/EmergencySOSButton";
import { VitalSignsMonitor } from "@/components/health/VitalSignsMonitor";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: primaryGroup, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['primaryCareGroup'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your care group",
          variant: "destructive",
        });
        return null;
      }

      const { data: group, error } = await supabase
        .from('care_group_members')
        .select('group_id, care_groups(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching care group:', error);
        toast({
          title: "Error",
          description: "Failed to load care group information",
          variant: "destructive",
        });
      }

      return group?.care_groups;
    }
  });

  if (isLoadingGroup) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-b-2 border-primary"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto px-4 py-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Care Companion</h1>
            <p className="text-gray-600 mt-2">Your comprehensive care management platform</p>
          </div>
          <div className="flex gap-4">
            <WellnessScore groupId={primaryGroup?.id} />
            <Button 
              onClick={() => navigate('/care-guides')}
              className="bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-2 h-4 w-4" />
              Generate Care Guides
            </Button>
          </div>
        </div>

        {primaryGroup?.id && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <EmergencySOSButton groupId={primaryGroup.id} />
            <VitalSignsMonitor groupId={primaryGroup.id} />
          </div>
        )}

        <QuickActions />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {primaryGroup?.id ? (
              <>
                <CareOverview groupId={primaryGroup.id} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <MedicationReminder groupId={primaryGroup.id} />
                  <CareMetrics groupId={primaryGroup.id} />
                </div>
              </>
            ) : (
              <motion.div 
                className="text-center py-8 bg-white rounded-lg shadow-sm"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Care Group Found</h3>
                <p className="text-muted-foreground mb-4">
                  Join a care group to access check-ins and other features
                </p>
                <Button 
                  onClick={() => navigate('/groups')}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Find or Create a Care Group
                </Button>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-6">
            <RecentActivity groupId={primaryGroup?.id} />
            <CareGuideExamples />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
