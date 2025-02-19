
export interface MedicationAdherenceTrend {
  date: string;
  adherence_rate: number;
  total_doses: number;
  taken_doses: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface MedicationPortalSettings {
  id?: string;
  group_id?: string;
  reminder_preferences: {
    voice_reminders: boolean;
    preferred_voice?: string;
    preferred_channels?: string[];
  };
  accessibility_settings: {
    voice_reminders: boolean;
  };
}

export interface MedicationScheduleBase {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  instructions?: string;
  start_date?: string;
  end_date?: string;
}

export interface MedicationReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
  preferred_channels: string[];
}

export interface MedicationAccessibilitySettings {
  voice_reminders: boolean;
}

export interface MedicationLogBase {
  id: string;
  schedule_id: string;
  taken_at: string;
  status: string;
  notes?: string;
}
