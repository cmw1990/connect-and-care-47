
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to ensure queries return proper promises
export async function asPromise<T>(
  query: ReturnType<typeof supabase.from>
): Promise<{ data: T | null; error: any }> {
  const { data, error } = await query;
  return { data, error };
}
