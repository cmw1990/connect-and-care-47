
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeSupabaseQuery, mockTableQuery } from "@/utils/supabaseHelpers";

/**
 * Hook to fetch care outcomes for a meeting
 */
export const useCareOutcomes = (meetingId: string) => {
  return useQuery({
    queryKey: ['care-outcomes', meetingId],
    queryFn: async () => {
      // If the care_outcome_metrics table doesn't exist in the DB schema,
      // this will safely return null instead of causing type errors
      try {
        return await safeSupabaseQuery(
          async () => supabase
            .from('care_outcome_metrics')
            .select('*')
            .eq('companion_meeting_id', meetingId)
            .single(),
          null
        );
      } catch (error) {
        console.error("Error fetching care outcomes:", error);
        return null;
      }
    },
    enabled: !!meetingId
  });
};
