
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

// Transform function to convert connection_type from string to the required type
export const transformConnectionType = (connectionType: string): 'carer' | 'pal' => {
  if (connectionType === 'carer' || connectionType === 'pal') {
    return connectionType;
  }
  // Default to 'carer' if the value doesn't match expected values
  return 'carer';
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
    
    const result = await query();
    // Add forEach method to the data property for backward compatibility
    if (result.data) {
      const dataWithForEach = result.data as T[] & { forEach: (callback: (item: T, index: number) => void) => void };
      if (!dataWithForEach.forEach) {
        dataWithForEach.forEach = function(callback) {
          return Array.isArray(this) ? this.forEach(callback) : [];
        };
      }
    }
    return result;
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
      // Return an object that has consistent property names
      return {
        id: user.id,
        email: user.email || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        first_name: data.first_name || '',  // Include both formats for compatibility
        last_name: data.last_name || '',    // Include both formats for compatibility
        role: data.role || 'user',
        created_at: data.created_at || new Date().toISOString()
      };
    }
  }
  
  return null;
};

// Utility to handle relation missing errors with default values
export const handleRelationData = <T extends Record<string, any>>(
  data: any,
  defaultValues: T
): T => {
  if (!data || typeof data === 'string' || (data as any).error) {
    return defaultValues;
  }
  return data as T;
};
