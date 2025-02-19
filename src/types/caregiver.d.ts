
export interface CaregiverProfile {
  id: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  hourly_rate: number;
  experience_years: number;
  identity_verified: boolean;
  background_check_status: string;
  specializations: string[];
  bio: string;
  avatar_url?: string;
  dementia_care_certified: boolean;
  latitude?: number;
  longitude?: number;
  ratings_aggregate?: {
    avg_rating: number;
    count: number;
  };
}

export interface CareReview {
  id: string;
  reviewee_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer_id: string;
  verified_review: boolean;
  booking_id: string;
}

export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
