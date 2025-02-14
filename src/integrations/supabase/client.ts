
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase';

const SUPABASE_URL = "https://csngjtaxbnebqfismwvs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbmdqdGF4Ym5lYnFmaXNtd3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDAzMjgsImV4cCI6MjA1NDAxNjMyOH0.WvdTMRrV7sWCA100UqYbLfjKG2ggf13avBweS0BOAbc";

type Database = {
  public: {
    Tables: Tables;
  };
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
