
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestResponse } from '@/types/supabase';

export function transformObject<T>(obj: any): T {
  if (!obj) return obj;
  const transformed = { ...obj };

  // Transform arrays of profiles/sender/assigned_user into single objects
  if (transformed.profiles && Array.isArray(transformed.profiles) && transformed.profiles.length === 1) {
    transformed.profiles = transformed.profiles[0];
  }

  // Transform sender array to single object
  if (transformed.sender && Array.isArray(transformed.sender) && transformed.sender.length === 1) {
    transformed.sender = transformed.sender[0];
  }

  // Transform assigned_user array to single object
  if (transformed.assigned_user && Array.isArray(transformed.assigned_user) && transformed.assigned_user.length === 1) {
    transformed.assigned_user = transformed.assigned_user[0];
  }

  return transformed as T;
}

export async function supabaseQueryWithTransform<T>(query: ReturnType<typeof supabase.from>): Promise<PostgrestResponse<T>> {
  try {
    const queryResult = await query;
    
    if (queryResult.error) {
      return { data: null, error: queryResult.error };
    }

    // Transform arrays of profiles/sender/assigned_user into single objects
    const transformedData = Array.isArray(queryResult.data) 
      ? queryResult.data.map(item => transformObject<T>(item))
      : transformObject<T>(queryResult.data);

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error in supabaseQueryWithTransform:', error);
    return { data: null, error: error as Error };
  }
}
