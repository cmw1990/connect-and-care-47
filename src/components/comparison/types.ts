
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
