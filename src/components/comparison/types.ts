export type Location = {
  country: string;
  state: string;
};

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
  id: string;
  name: string;
  averageRating: number;
  features?: string[];
  aiInsights?: string;
}