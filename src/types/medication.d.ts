
export interface MedicationReminderPreferences {
  voice_reminders: boolean;
  preferred_voice?: string;
  preferred_channels: string[];
}

export interface MedicationAccessibilitySettings {
  voice_reminders: boolean;
}

export interface MedicationPortalSettings {
  id?: string;
  group_id?: string;
  reminder_preferences: MedicationReminderPreferences;
  accessibility_settings: MedicationAccessibilitySettings;
  created_at?: string;
  updated_at?: string;
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
