
export interface MedicationAdherenceTrend {
  id: string;
  group_id: string;
  date: string;
  adherence_rate: number;
  total_doses: number;
  taken_doses: number;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationSupervisionSummary {
  id: string;
  group_id: string;
  supervisor_id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationPortalSettings {
  id: string;
  group_id: string;
  reminder_preferences: {
    voice_reminders?: boolean;
    preferred_voice?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface MedicationLog {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at?: string;
  administered_by?: string;
  verified_by?: string;
  status?: string;
  notes?: string;
  photo_verification_url?: string;
  side_effects?: any;
  symptoms?: any;
  created_at?: string;
  medication_schedules?: {
    medication_name: string;
    dosage: string;
  };
}

export interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
  created_at?: string;
  updated_at?: string;
}
