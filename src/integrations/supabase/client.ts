
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://csngjtaxbnebqfismwvs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbmdqdGF4Ym5lYnFmaXNtd3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDAzMjgsImV4cCI6MjA1NDAxNjMyOH0.WvdTMRrV7sWCA100UqYbLfjKG2ggf13avBweS0BOAbc';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to ensure queries return proper promises
export async function asPromise<T>(query: ReturnType<typeof supabase.from>) {
  const result = await query;
  return { data: result.data as T, error: result.error };
}
