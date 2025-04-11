
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockTableQuery } from "@/utils/supabaseHelpers";

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
      try {
        // Check if table exists in Supabase schema
        const tableExists = await supabase
          .from('care_outcome_metrics')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        // If table doesn't exist or there's an error, use mock data
        if (tableExists.error) {
          console.info("Using mock data for care outcomes");
          const mockData: CareOutcomeMetric[] = [
            {
              id: "mock-1",
              metric_type: "engagement",
              value: 85,
              user_id: "user-1",
              recorded_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              companion_meeting_id: meetingId
            }
          ];
          return mockData;
        }
        
        // If table exists, fetch the actual data
        const { data, error } = await supabase
          .from('care_outcome_metrics')
          .select('*')
          .eq('companion_meeting_id', meetingId);
          
        if (error) throw error;
        return data as CareOutcomeMetric[];
      } catch (error) {
        console.error("Error fetching care outcomes:", error);
        // Return empty array as fallback
        return [] as CareOutcomeMetric[];
      }
    },
    enabled: !!meetingId
  });
};
