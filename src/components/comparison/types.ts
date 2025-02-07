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
}

export interface DetailedReviewMetrics {
  staff_rating: number;
  cleanliness_rating: number;
  care_quality_rating: number;
  amenities_rating: number;
  activities_rating: number;
  value_rating: number;
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
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export interface FacilitySubscription {
  id: string;
  facility_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired';
  payment_status: 'pending' | 'paid' | 'failed';
}

export interface CareProduct {
  id: string;
  name: string;
  description: string | null;
  affiliate_link: string | null;
  price_range?: { min: number; max: number } | null;
  ratings?: Record<string, number> | null;
  specifications?: Record<string, any> | null;
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
  specifications?: Record<string, any>;
  leadGenerated?: boolean;
}

export interface AffiliateInteraction {
  id: string;
  product_id: string;
  interaction_type: 'click' | 'conversion';
  affiliate_link: string;
  clicked_at: string;
}

export interface FacilityLead {
  id: string;
  facility_id: string;
  lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  contact_preference: 'email' | 'phone' | 'both';
  phone_number?: string;
  email?: string;
  notes?: string;
}
