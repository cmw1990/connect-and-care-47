import type { Database as GeneratedDatabase } from '@/integrations/supabase/types';

export type Database = GeneratedDatabase;
export type Tables = Database['public']['Tables'];

// Shared profile type
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

// Message types
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

// Care Update types
export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: UserProfile;
}

// Insurance types
export interface InsuranceAnalytics {
  id: string;
  data: Record<string, any>;
  period: string;
}

export interface InsuranceDeductible {
  id: string;
  amount: number;
  met_amount: number;
  type: string;
}

export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
  frequency: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
}

export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at: string;
  status: 'taken' | 'missed' | 'pending' | 'pending_verification' | 'rejected';
  administered_by?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationScheduleBase;
}

export interface MedicationReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
  preferred_channels: string[];
}

export interface MedicationPortalSettings {
  id?: string;
  group_id?: string;
  reminder_preferences: MedicationReminderPreferences;
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Schedule type
export interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  type: string;
}

// Interface with known properties for user profile
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

// Message types
export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: UserProfile;
}

// Care Update types
export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: UserProfile;
}

// Post types
export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: UserProfile;
}

// Task types
export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  assigned_user: UserProfile | null;
}

// Insurance Document types
export interface InsuranceDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
  };
}

// Medication types
export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
  frequency: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
}

export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at: string;
  status: 'taken' | 'missed' | 'pending' | 'pending_verification' | 'rejected';
  administered_by?: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationScheduleBase;
}

export interface MedicationReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
  preferred_channels: string[];
}

export interface MedicationPortalSettings {
  id?: string;
  group_id?: string;
  reminder_preferences: MedicationReminderPreferences;
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Helper type guards
export function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj.first_name !== 'undefined' && typeof obj.last_name !== 'undefined';
}

// Supabase query helper
export async function supabaseQueryWithTransform<T>(query: any): Promise<{ data: T | null; error: any }> {
  const { data, error } = await query;
  
  if (error) {
    return { data: null, error };
  }

  // Transform arrays of profiles/sender/assigned_user into single objects
  const transformedData = Array.isArray(data) 
    ? data.map(transformObject)
    : transformObject(data);

  return { data: transformedData as T, error: null };
}

// Insurance Coverage types
export interface InsuranceCoverage {
  id: string;
  name: string;
  type: string;
  covered_services: string[];
  auto_verification: boolean;
}

// Care Report types
export interface CareReport {
  id: string;
  recorded_at: string;
  metric_value: any;
  created_by: string;
  profiles: UserProfile;
}

// Dementia Support Types
export interface DementiaProfile {
  stage: 'early' | 'middle' | 'late';
  primary_interests: string[];
  communication_preferences: {
    preferred_name: string;
    preferred_language: string;
    communication_style: 'visual' | 'verbal' | 'written';
    trigger_topics?: string[];
    comfort_topics: string[];
  };
  daily_routines: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  memory_support: {
    important_dates: Array<{ date: string; description: string }>;
    key_people: Array<{ name: string; relation: string; photo_url?: string }>;
    life_stories: Array<{ title: string; content: string; photos?: string[] }>;
  };
}

export interface DementiaTopicCard {
  id: string;
  title: string;
  category: 'memories' | 'activities' | 'family' | 'interests';
  content: string;
  visual_aids?: string[];
  difficulty_level: 'easy' | 'medium' | 'challenging';
  engagement_duration: number; // in minutes
  success_indicators: string[];
}

// Upcoming Schedule types
export interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  type: string;
}

// Insurance Provider types
export interface InsuranceProvider {
  id: string;
  name: string;
  provider_name: string;
  specialty: string;
  network_status: 'in-network' | 'out-of-network';
  accepting_new_patients: boolean;
  rating?: number;
  locations: Array<{
    address: string;
    phone: string;
  }>;
}

export interface ProviderSearchFilters {
  specialty?: string;
  locations?: string[];
  network_status?: 'in-network' | 'out-of-network';
  accepting_new_patients?: boolean;
  distance: number;
}
