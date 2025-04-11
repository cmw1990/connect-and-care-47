
import { Json } from "@/integrations/supabase/types";

// Base medication schedule structure
export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency: string;
  time_of_day: string[];
  group_id: string;
  created_at?: string;
}

// Medication logs
export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at?: string;
  status: 'taken' | 'missed' | 'pending_verification' | 'verified';
  notes?: string;
  photo_verification_url?: string;
  medication_schedule?: MedicationScheduleBase;
  group_id: string;
}

// Adherence trends
export interface MedicationAdherenceTrend {
  id: string;
  group_id: string;
  date: string;
  adherence_rate: number;
  missed_doses: number;
  total_doses: number;
  created_at?: string;
}

// Supervision summary
export interface MedicationSupervisionSummary {
  id: string;
  group_id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
  supervisor_id: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
}

// Portal settings
export interface MedicationPortalSettings {
  reminder_preferences?: {
    voice_reminders?: boolean;
    preferred_voice?: string;
    preferred_channels?: string[];
  };
  accessibility_settings?: {
    voice_reminders?: boolean;
  };
}
