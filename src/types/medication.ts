
// Base types for medication-related entities
export interface MedicationBase {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Core schedule type without circular references
export interface MedicationScheduleCore {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
}

// Core log type without circular references
export interface MedicationLogCore {
  id: string;
  taken_at: string;
  administered_at?: string;
  status?: 'pending' | 'taken' | 'missed' | 'overdue';
  schedule_id: string;
}

// Extended types that reference core types
export interface MedicationSchedule extends MedicationBase, MedicationScheduleCore {
  logs?: MedicationLogCore[];
}

export interface MedicationLog extends MedicationBase, MedicationLogCore {
  administered_by?: string;
  verified_by?: string;
  notes?: string;
  photo_verification_url?: string;
  side_effects?: Record<string, unknown>;
  symptoms?: Record<string, unknown>;
  schedule?: MedicationScheduleCore;
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

export interface MedicationPortalSettings extends MedicationBase {
  group_id: string;
  reminder_preferences: {
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
}
