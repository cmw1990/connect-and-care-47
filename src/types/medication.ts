
export interface MedicationAdherenceTrend {
  date: string;
  adherence_rate: number;
  total_doses: number;
  taken_doses: number;
  group_id: string;
}

export interface MedicationSupervisionSummary {
  group_id: string;
  supervisor_id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
}

export interface MedicationPortalSettings {
  id: string;
  group_id: string;
  reminder_preferences: {
    voice_reminders?: boolean;
    preferred_voice?: string;
  };
  created_at: string;
  updated_at: string;
}
