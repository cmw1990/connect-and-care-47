import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanionActivities = () => {
  return useQuery({
    queryKey: ['companion-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companion_activity_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};