
export interface CaregiverProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  experience_years?: number;
  hourly_rate: number;
  availability?: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  rating?: number;
  reviews_count?: number;
  user?: UserProfile;
  ratings_aggregate?: {
    avg_rating: number;
    count: number;
  };
}

export interface CareReview {
  id: string;
  reviewer_id: string;
  caregiver_id: string;
  rating?: number;
  comment?: string;
  created_at?: string;
}

export interface Availability {
  id: string;
  caregiver_id?: string;
  user_id?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  available_days?: string[];
  available_hours?: { start: string; end: string }[];
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  connection_type: "carer" | "pal";
  created_at?: string;
  updated_at?: string;
  requester?: UserProfile;
  recipient?: UserProfile;
}

export interface TimeSlot {
  id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
}

export interface CompanionMatch {
  id: string;
  user: UserProfile;
  expertise_areas: string[];
  dementia_experience: boolean;
  communication_preferences: string[];
  languages: string[];
  virtual_meeting_preference: boolean;
  in_person_meeting_preference: boolean;
  rating: number;
  hourly_rate: number;
  identity_verified: boolean;
  mental_health_specialties: string[];
  support_tools_proficiency: any;
  virtual_meeting_tools: string[];
  interests: string[];
  cognitive_engagement_activities: {
    memory_games?: string[];
    brain_teasers?: string[];
    social_activities?: string[];
    creative_exercises?: string[];
  };
}
