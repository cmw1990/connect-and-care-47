
export interface CareReview {
  id: string;
  rating: number;
  comment?: string;
  reviewer_id: string;
  caregiver_id: string;
  created_at: string;
}

export interface Availability {
  user_id: string;
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  };
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
  availability: string[];
  location?: string;
  verified: boolean;
  rating: number;
  reviews_count: number;
}
