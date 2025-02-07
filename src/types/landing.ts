
export interface LandingSection {
  id: string;
  title: string;
  description: string | null;
  section_type: 'webapp_promo' | 'caregiver_search' | 'facility_search' | 'product_guide';
  content: {
    features?: string[];
    benefits?: string[];
    tools?: string[];
    categories?: string[];
  };
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
