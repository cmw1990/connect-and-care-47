// Simple base types without circular references
export interface MedicationBase {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Flat type definitions without nesting
export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
}

export interface MedicationLogBase {
  id: string;
  taken_at: string;
  administered_at?: string;
  status?: 'pending' | 'taken' | 'missed' | 'overdue' | 'pending_verification' | 'rejected';
  schedule_id: string;
  group_id: string;
  administered_by?: string;
  verified_by?: string;
  verified_at?: string;
  verification_status?: 'approved' | 'rejected';
  notes?: string;
  photo_verification_url?: string;
}

// Settings interface without circular references
export interface MedicationReminderPreferences {
  preferred_channels: string[];
}

export interface MedicationAccessibilitySettings {
  voice_reminders: boolean;
}

export interface MedicationPortalSettings extends MedicationBase {
  group_id: string;
  reminder_preferences: MedicationReminderPreferences;
  accessibility_settings: MedicationAccessibilitySettings;
}

// Other flat type definitions
export interface MedicationAdherenceTrend extends MedicationBase {
  group_id: string;
  date: string;
  adherence_rate: number;
  total_doses: number;
  taken_doses: number;
}

export interface MedicationSupervisionSummary extends MedicationBase {
  group_id: string;
  supervisor_id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
}
