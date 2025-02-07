import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCareOutcomes = (meetingId: string) => {
  return useQuery({
    queryKey: ['care-outcomes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_outcome_metrics')
        .select('*')
        .eq('companion_meeting_id', meetingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!meetingId
  });
};