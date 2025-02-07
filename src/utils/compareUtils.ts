
import { Json } from "@/integrations/supabase/types";

export interface CareItem {
  id: string;
  name: string;
  description?: string | null;
  ratings?: Json | null;
  listing_type?: string | null;
  affiliate_link?: string | null;
  price_range?: Json | null;
}

export const compareCareItems = (items: CareItem[]): Record<string, any> => {
  if (!items || items.length < 2) {
    throw new Error('At least two items are required for comparison');
  }

  return items.reduce((acc, item) => {
    const ratings = item.ratings as Record<string, number> || {};
    const avgRating = Object.keys(ratings).length > 0
      ? Object.values(ratings).reduce((sum, val) => sum + val, 0) / Object.keys(ratings).length 
      : 0;

    acc[item.id] = {
      name: item.name,
      description: item.description,
      averageRating: avgRating,
    };
    return acc;
  }, {} as Record<string, any>);
};
