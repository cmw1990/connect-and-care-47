export interface CaregiverSchedule {
  id: string;
  shift_start: string;
  shift_end: string;
  caregiver_id: string;
  group_id: string;
}

export interface CareMetrics {
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    oxygen_level?: number;
  };
  medication_adherence?: number;
  mood_score?: number;
  activity_level?: number;
  sleep_quality?: number;
}

export interface CareReport {
  id: string;
  recorded_at: string;
  metric_value: {
    notes: string;
    timestamp: string;
  };
  created_by?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface Availability {
  id: string;
  user_id: string;
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  instructions: string;
  start_date: string;
  end_date: string | null;
}
