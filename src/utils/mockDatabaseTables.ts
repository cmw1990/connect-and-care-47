
import { supabase } from "@/integrations/supabase/client";
import { mockSupabase } from "./supabaseHelpers";

// Utility to check if tables exist in the Supabase database
export const mockMissingTables = () => {
  const originalFrom = supabase.from;
  const existingTables = [
    'care_teams', 'availability_slots', 'care_analytics', 'care_connections',
    'care_facilities', 'care_notes', 'care_outcome_metrics', 'care_products',
    'care_quality_metrics', 'care_reviews', 'care_routines', 'care_tasks',
    'care_team_availability', 'care_team_members', 'care_updates',
    'caregiver_availability', 'caregiver_bookings', 'caregiver_profiles',
    'companion_activity_templates', 'companion_profiles', 'dementia_profiles',
    'insurance_analytics', 'medication_adherence_trends', 'medication_portal_settings',
    'medication_schedules', 'medication_supervision_summary', 'medication_verifications',
    'patient_check_ins', 'patient_info', 'patient_locations', 'private_messages',
    'profiles', 'team_messages', 'temp_services', 'video_consultations'
  ];

  // Monkey-patch the supabase.from method to use mock for missing tables
  (supabase as any).from = function(tableName: string) {
    if (existingTables.includes(tableName)) {
      return originalFrom.call(this, tableName);
    }
    
    console.warn(`Table '${tableName}' not found in schema, using mock data.`);
    return mockSupabase.from(tableName);
  };
};

// List of mock data for various tables that don't exist yet
export const mockData = {
  insurance_documents: [],
  insurance_deductibles: [],
  medical_device_data: [],
  facility_leads: [],
  insurance_claims: [],
  background_checks: [],
  verification_requests: [],
  user_insurance: [],
  insurance_plans: [],
  care_recipients: [],
  care_circle_invites: [],
  medical_documents: [],
  danger_zone_types: [],
  care_group_members: [],
  geofences: [],
  tasks: [],
  group_posts: [],
  care_groups: [],
  affiliate_interactions: []
};

// Initialize mock tables
export const initMockTables = () => {
  mockMissingTables();
  
  // Log a message to the console about the mocking
  console.info(
    'Some database tables are being mocked for development. ' +
    'Data will not persist between sessions.'
  );
};
