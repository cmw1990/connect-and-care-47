
import { Json } from "@/integrations/supabase/types";

// Define the database tables from our migration
export interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency: string;
  time_of_day: string[];
  group_id: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationVerification {
  id: string;
  group_id: string;
  photo_url?: string;
  verification_time?: string;
  status: string;
  symptoms?: string[];
  side_effects?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationPortalSetting {
  id: string;
  group_id: string;
  reminder_preferences: Json;
  accessibility_settings: Json;
  created_at: string;
  updated_at: string;
}

export interface MedicationAdherenceTrend {
  id: string;
  group_id: string;
  date: string;
  adherence_rate: number;
  missed_doses: number;
  total_doses: number;
  created_at: string;
}

export interface MedicationSupervisionSummary {
  id: string;
  group_id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
  supervisor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientLocation {
  id: string;
  group_id: string;
  location_enabled: boolean;
  current_location: Json;
  created_at: string;
  updated_at: string;
}

export interface PatientCheckIn {
  id: string;
  group_id: string;
  check_in_type: string;
  scheduled_time?: string;
  completed_time?: string;
  status: string;
  mood_score?: number;
  pain_level?: number;
  sleep_hours?: number;
  medication_taken?: boolean;
  nutrition_log?: Json;
  vital_signs?: Json;
  social_interactions?: string[];
  caregiver_notes?: string;
  photo_verification_url?: string;
  response_data?: Json;
  created_at: string;
  updated_at: string;
}
