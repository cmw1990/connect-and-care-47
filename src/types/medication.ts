
// Base types for medication-related entities
export interface MedicationBase {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Core medication types without circular references
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

// Complete types that extend the base types
export interface MedicationSchedule extends MedicationBase, MedicationScheduleBase {}

export interface MedicationLog extends MedicationBase, MedicationLogBase {
  schedule?: MedicationScheduleBase;
}

export interface MedicationPortalSettings extends MedicationBase {
  group_id: string;
  reminder_preferences: {
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
}

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
