
export interface Location {
  country: string;
  state: string;
  city: string;
}

export interface CareFacility {
  id: string;
  name: string;
  description: string | null;
  location: Location;
  listing_type: string | null;
  ratings?: Record<string, number> | null;
  cost_range?: { min: number; max: number } | null;
  services?: string[];
  subscription_tier?: string;
  featured_until?: string;
  verified?: boolean;
  response_rate?: number;
  virtual_tour_url?: string;
  amenities?: string[];
  awards?: Array<{
    name: string;
    year: number;
    issuer: string;
  }>;
  staff_ratio?: number;
  quality_metrics?: {
    cleanliness: number;
    staff_training: number;
    medical_care: number;
    activities: number;
    food_quality: number;
    safety_measures: number;
  };
  specialized_care?: string[];
  languages_supported?: string[];
  insurance_accepted?: string[];
  accreditations?: Array<{
    name: string;
    issuer: string;
    valid_until: string;
  }>;
  visiting_hours?: {
    weekday: string;
    weekend: string;
    holidays: string;
  };
  transportation_provided?: boolean;
  emergency_response_time?: number;
}

export interface DetailedReviewMetrics {
  staff_rating: number;
  cleanliness_rating: number;
  care_quality_rating: number;
  amenities_rating: number;
  activities_rating: number;
  value_rating: number;
  food_rating?: number;
  safety_rating?: number;
  communication_rating?: number;
  accessibility_rating?: number;
}

export interface FacilityReview {
  id: string;
  facility_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
  verified_review: boolean;
  created_at: string;
  metrics?: DetailedReviewMetrics;
  response?: {
    response_text: string;
    responded_by: string;
    created_at: string;
  };
  helpful_count?: number;
  review_type?: 'resident' | 'family' | 'professional' | 'visitor';
  stay_duration?: string;
  would_recommend?: boolean;
}

export interface ComparisonResult {
  name: string;
  description?: string;
  averageRating: number;
  features?: string[];
  aiInsights?: string;
  sentimentAnalysis?: string;
  costBenefitAnalysis?: string;
  trendAnalysis?: string;
  qualityScore?: number;
  safetyScore?: number;
  valueScore?: number;
  staffingScore?: number;
  matchScore?: number;
  specifications?: Record<string, any>;
  competitiveAdvantages?: string[];
  improvements?: string[];
  popularWith?: string[];
  bestSuitedFor?: string[];
  redFlags?: string[];
  costEffectiveness?: {
    score: number;
    analysis: string;
    comparison: string;
  };
  staffAnalysis?: {
    turnover_rate?: number;
    experience_level?: string;
    training_quality?: string;
    resident_ratio?: number;
  };
  locationAnalysis?: {
    accessibility: number;
    neighborhood_safety: number;
    nearby_amenities: string[];
    medical_proximity: string[];
  };
  leadGenerated?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  analytics_access?: string[];
  support_level?: string;
  custom_branding?: boolean;
  api_access?: boolean;
  premium_features?: string[];
}

export interface FacilitySubscription {
  id: string;
  facility_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired';
  payment_status: 'pending' | 'paid' | 'failed';
  auto_renew?: boolean;
  usage_stats?: {
    api_calls?: number;
    storage_used?: number;
    features_used?: string[];
  };
}

export interface CareProduct {
  id: string;
  name: string;
  description: string | null;
  affiliate_link: string | null;
  price_range?: { min: number; max: number } | null;
  ratings?: Record<string, number> | null;
  specifications?: Record<string, any> | null;
  verification_status?: 'pending' | 'in_progress' | 'verified' | 'failed' | 'expired' | null;
  safety_certifications?: Array<{
    name: string;
    issuer: string;
    expiry?: string;
  }>;
  warranty_info?: {
    duration: string;
    coverage: string[];
    provider: string;
  };
  compatibility?: {
    devices?: string[];
    systems?: string[];
    standards?: string[];
  };
  maintenance_requirements?: {
    frequency: string;
    tasks: string[];
    professional_required: boolean;
  };
  training_required?: boolean;
  training_materials?: {
    video_url?: string;
    manual_url?: string;
    difficulty_level?: string;
  };
}

export interface AffiliateInteraction {
  id: string;
  product_id: string;
  interaction_type: 'click' | 'conversion' | 'wishlist' | 'comparison';
  affiliate_link: string;
  clicked_at: string;
  converted_at?: string;
  revenue?: number;
  user_segment?: string;
  source_page?: string;
  device_type?: string;
}

export interface FacilityLead {
  id: string;
  facility_id: string;
  lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  contact_preference: 'email' | 'phone' | 'both';
  phone_number?: string;
  email?: string;
  notes?: string;
  care_needs?: string[];
  budget_range?: { min: number; max: number };
  preferred_move_in?: string;
  care_recipient_details?: {
    age?: number;
    mobility?: string;
    medical_conditions?: string[];
    special_requirements?: string[];
  };
  source?: string;
  assigned_to?: string;
  last_contacted?: string;
  follow_up_date?: string;
}

export interface VerificationStatus {
  identity: boolean;
  background: boolean;
  references: boolean;
  professional_licenses?: boolean;
  insurance_coverage?: boolean;
  training_certificates?: boolean;
}
