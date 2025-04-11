
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a database table exists
 * @param tableName The name of the table to check
 * @returns True if the table exists, false otherwise
 */
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Code 42P01 means the table doesn't exist
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error);
    return false;
  }
};

/**
 * Creates mock data handlers for tables that don't exist yet
 * This is useful for development when the database schema is not yet complete
 */
export const mockMissingTables = async () => {
  console.log('Initializing mock tables for development');
  
  // Define the tables you expect to use in the app
  const expectedTables = [
    'care_appointments',
    'insurance_claims',
    'user_insurance',
    'insurance_plans',
    'insurance_deductibles',
    'insurance_documents',
    'medical_documents',
    'medical_device_data',
    'care_circle_invites',
    'care_recipients',
    'care_group_members',
    'verification_requests',
    'background_checks',
    'affiliate_interactions',
    'facility_leads',
    'care_connections',
    'group_posts',
    'tasks',
    'danger_zone_types',
    'care_groups',
    'geofences'
  ];
  
  // Check which tables exist and which need to be mocked
  for (const tableName of expectedTables) {
    const exists = await tableExists(tableName);
    if (!exists) {
      console.log(`Table '${tableName}' does not exist, using mocked responses`);
      // Implementation of mocking is actually done in the safeSupabaseQuery and mockTableQuery functions
      // This is just for logging purposes
    }
  }
};
