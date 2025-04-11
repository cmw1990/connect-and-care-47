
import { createClient } from '@supabase/supabase-js';
import { Database, ExtendedDatabase } from '@/types/database.types';

const SUPABASE_URL = "https://yekarqanirdkdckimpna.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc";

// Create and export the Supabase client with our extended database type
export const supabaseClient = createClient<ExtendedDatabase>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Export some helper functions for better error handling
export const handleSupabaseError = (error: any) => {
  if (error) {
    console.error('Supabase error:', error);
    return error.message || 'An error occurred with the database operation';
  }
  return null;
};

// Function to check if a table exists
export const checkTableExists = async (tableName: string) => {
  try {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to safely query Supabase with fallback
export const safeQueryWithFallback = async <T>(
  tableName: string,
  query: () => Promise<{ data: T[] | null; error: any }>,
  fallbackData: T[] = []
): Promise<{ data: T[] | null; error: any }> => {
  try {
    const exists = await checkTableExists(tableName);
    if (!exists) {
      console.warn(`Table ${tableName} does not exist. Using fallback data.`);
      return { data: fallbackData, error: null };
    }
    
    return await query();
  } catch (error) {
    console.error(`Error executing query on ${tableName}:`, error);
    return { data: fallbackData, error: error as any };
  }
};

// Get current user helper that handles profiles properly
export const getCurrentUser = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (user) {
    const { data } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      return {
        id: user.id,
        email: user.email || '',
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role || 'user',
        created_at: data.created_at || new Date().toISOString()
      };
    }
  }
  
  return null;
};
