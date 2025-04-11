
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeSupabaseQuery } from "@/utils/supabaseHelpers";

export const useCareOutcomes = (meetingId: string) => {
  return useQuery({
    queryKey: ['care-outcomes', meetingId],
    queryFn: async () => {
      return safeSupabaseQuery(
        async () => supabase
          .from('care_outcome_metrics')
          .select('*')
          .eq('companion_meeting_id', meetingId)
          .single(),
        null
      );
    },
    enabled: !!meetingId
  });
};
