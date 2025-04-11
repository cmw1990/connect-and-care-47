
import { createClient } from '@supabase/supabase-js';
import { ExtendedDatabase } from '@/types/database.types';

const SUPABASE_URL = "https://yekarqanirdkdckimpna.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc";

export const supabaseClient = createClient<ExtendedDatabase>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
