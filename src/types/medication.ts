
// Break circular dependency by making a base type
export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  time_of_day: string[];
  group_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationSchedule extends MedicationScheduleBase {
  medication_logs?: Array<Omit<MedicationLog, 'medication_schedule'>>;
}

export interface MedicationLog {
  id: string;
  schedule_id: string;
  taken_at: string;
  administered_at?: string;
  administered_by?: string;
  verified_by?: string;
  status?: 'pending' | 'taken' | 'missed' | 'overdue';
  notes?: string;
  photo_verification_url?: string;
  side_effects?: Record<string, unknown>;
  symptoms?: Record<string, unknown>;
  created_at?: string;
  medication_schedule?: MedicationScheduleBase;
}

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
    preferred_channels: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}
