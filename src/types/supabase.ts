
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

// Additional types needed for resolving errors
export interface DementiaProfile {
  id: string;
  user_id: string;
  stage: string;
  symptoms?: string[];
  care_needs?: string[];
  created_at: string;
  updated_at: string;
}

export interface DementiaTopicCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: string;
}

export interface CompanionMatch {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  expertise_areas: string[];
  dementia_experience: boolean;
  communication_preferences: string[];
  languages: string[];
  virtual_meeting_preference: boolean;
  in_person_meeting_preference: boolean;
  rating: number;
  hourly_rate: number;
  identity_verified: boolean;
  mental_health_specialties: string[];
  support_tools_proficiency: Json;
  virtual_meeting_tools: string[];
  interests: string[];
  cognitive_engagement_activities: {
    memory_games?: string[];
    brain_teasers?: string[];
    social_activities?: string[];
    creative_exercises?: string[];
  };
  cultural_competencies?: string[];
  music_therapy_certified?: boolean;
  art_therapy_certified?: boolean;
  availability?: Json;
  background_check_date?: string;
  bio?: string;
  child_engagement_activities?: Json;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  connection_type: "carer" | "pal";
  status: string;
  created_at: string;
  updated_at: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  recipient: {
    first_name: string;
    last_name: string;
  };
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  document_type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CareRecipient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  care_needs: string[];
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  profile_id: string;
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
  category: string;
  description?: string;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export interface CareUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface InsuranceDeductible {
  id: string;
  amount: number;
  remaining: number;
  type: string;
  insurance_id: string;
  year: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Additional properties for UI
  total_amount?: number;
  met_amount?: number;
  deductible_type?: string;
}

export interface InsuranceDocument {
  id: string;
  file_url: string;
  document_type: string;
  metadata: Json;
  user_id: string;
  insurance_id: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceDocumentResponse {
  id: string;
  file_url: string;
  document_type: string;
  metadata: Json;
  user_id: string;
  insurance_id: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalDevice {
  id: string;
  device_type: string;
  readings: {
    blood_pressure?: {
      systolic: number;
      diastolic: number;
    };
    heart_rate?: number;
    temperature?: number;
  };
  recorded_at: string;
}

// Add SelectQueryError type for handling Supabase errors
export type SelectQueryError<T> = {
  error: true;
} & String;

// DayContentProps interface for Calendar components
export interface DayContentProps {
  date: Date;
  monthStartDate?: Date;
  selected?: boolean;
  displayMonth?: boolean;
  day?: number;
}
