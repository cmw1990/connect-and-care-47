
export interface MedicationAdherenceTrend {
  date: string;
  adherence_rate: number;
  total_doses: number;
  taken_doses: number;
}

export interface MedicationSupervisionSummary {
  id: string;
  total_medications: number;
  pending_verifications: number;
  approved_medications: number;
  missed_medications: number;
  avg_verification_time_minutes: number;
}

export interface MedicationPortalSettings {
  reminder_preferences: {
    voice_reminders: boolean;
    preferred_voice?: string;
  };
}
