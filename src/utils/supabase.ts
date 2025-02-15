
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/supabase';

export type DatabaseSchema = Database['public']['Tables']

// Transform helper functions
export function transformSupabaseResponse<T>(data: any): T {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(transformObject) as T;
  }
  return transformObject(data) as T;
}

export function transformObject(obj: any): any {
  if (!obj) return obj;

  const transformed = { ...obj };

  // Transform profiles array to single object
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

  return transformed;
}

// Supabase query helper
export async function supabaseQueryWithTransform<T>(query: ReturnType<typeof supabase.from>): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await query;
    
    if (error) {
      return { data: null, error };
    }

    // Transform arrays of profiles/sender/assigned_user into single objects
    const transformedData = transformSupabaseResponse<T>(data);

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error in supabaseQueryWithTransform:', error);
    return { data: null, error };
  }
}
