
import { transformSupabaseResponse } from '@/types/supabase';

export async function supabaseQueryWithTransform<T>(
  queryPromise: Promise<{ data: any; error: any }>
): Promise<{ data: T | null; error: any }> {
  const { data, error } = await queryPromise;
  if (error) return { data: null, error };
  return { data: transformSupabaseResponse<T>(data), error: null };
}
