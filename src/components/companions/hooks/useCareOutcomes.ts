
import { useQuery } from "@tanstack/react-query";
import { supabaseClient, safeQueryWithFallback } from "@/integrations/supabaseClient";

/**
 * Type for care outcome metrics response
 */
interface CareOutcomeMetric {
  id: string;
  metric_type: string;
  value: number;
  user_id: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  companion_meeting_id?: string;
}

/**
 * Hook to fetch care outcomes for a meeting
 */
export const useCareOutcomes = (meetingId: string) => {
  return useQuery({
    queryKey: ['care-outcomes', meetingId],
    queryFn: async () => {
      if (!meetingId) return [] as CareOutcomeMetric[];
      
      return await safeQueryWithFallback<CareOutcomeMetric>(
        'care_outcome_metrics',
        () => supabaseClient
          .from('care_outcome_metrics')
          .select('*')
          .eq('companion_meeting_id', meetingId),
        [] // fallback data
      ).then(result => result.data || []);
    },
    enabled: !!meetingId
  });
};
