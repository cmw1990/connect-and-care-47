
export interface CareReview {
  id: string;
  rating: number;
  comment?: string;
  reviewer_id: string;
  caregiver_id: string;
  created_at: string;
}

export interface Availability {
  id?: string;
  user_id: string;
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  };
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  recurring?: boolean;
}

export interface CaregiverProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  specialties: string[];
  certifications?: string[];
  experience_years?: number;
  hourly_rate: number;
  hourlyRate?: number;
  availability: string[];
  location?: string;
  verified: boolean;
  rating: number;
  reviews_count: number;
  latitude?: number;
  longitude?: number;
}
