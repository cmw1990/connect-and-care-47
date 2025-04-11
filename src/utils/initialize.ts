
import { supabase } from "@/integrations/supabase/client";

// Initialize the application
export function initializeApp() {
  // For development, verify connection to Supabase
  verifySupabaseConnection();
}

// Test the Supabase connection
async function verifySupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn('Supabase connection error:', error.message);
    } else {
      console.info('Supabase connection successful');
    }
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
  }
}
