import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    // Create caregiver_profiles table
    await supabase.rpc('create_caregiver_profiles_table');
    
    // Create specialties table
    await supabase.rpc('create_specialties_table');
    
    // Insert initial specialties
    await supabase.rpc('insert_initial_specialties');
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}
