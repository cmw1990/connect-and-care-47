
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Index = () => {
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

  const { data: upcomingAppointments } = useQuery({
    queryKey: ['upcomingAppointments', primaryGroup?.id],
    enabled: !!primaryGroup?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('group_id', primaryGroup!.id)
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
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
        <DashboardHeader 
          notifications={notifications} 
          groupId={primaryGroup?.id} 
        />
        <DashboardContent 
          primaryGroup={primaryGroup} 
          upcomingAppointments={upcomingAppointments}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
