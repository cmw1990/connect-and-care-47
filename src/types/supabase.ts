
import type { Database as GeneratedDatabase } from '@/integrations/supabase/types';
import type { PostgrestSingleResponse, PostgrestResponse as SupabaseResponse } from '@supabase/supabase-js';

export type Database = GeneratedDatabase;
export type Tables = Database['public']['Tables'];

export interface PostgrestResponse<T> {
  data: T | null;
  error: Error | null;
}

// Shared profile type
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

// Helper type guard
export function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj.first_name !== 'undefined' && typeof obj.last_name !== 'undefined';
}

// Query Types
export type PostgrestQueryResponse<T> = SupabaseResponse<T>;
export type PostgrestSingleQueryResponse<T> = PostgrestSingleResponse<T>;
