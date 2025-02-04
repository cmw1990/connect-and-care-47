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
}

export interface CareProduct {
  id: string;
  name: string;
  description: string | null;
  affiliate_link: string | null;
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
}