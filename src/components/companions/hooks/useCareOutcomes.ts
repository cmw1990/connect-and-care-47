
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabaseClient";

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
      if (!meetingId) return [];
      
      try {
        const { data, error } = await supabaseClient
          .from('care_outcome_metrics')
          .select('*')
          .eq('companion_meeting_id', meetingId);
            
        if (error) {
          console.error("Error fetching care outcomes:", error);
          return [] as CareOutcomeMetric[];
        }
        
        return (data || []) as CareOutcomeMetric[];
      } catch (error) {
        console.error("Exception fetching care outcomes:", error);
        return [] as CareOutcomeMetric[];
      }
    },
    enabled: !!meetingId
  });
};
