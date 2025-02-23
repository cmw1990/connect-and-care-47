
import { supabase } from '@/lib/supabase/client';

export type SearchFilters = {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  status?: string[];
  providerIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'price' | 'rating' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
};

export type SearchResults = {
  products: any[];
  services: any[];
  providers: any[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
    providers: { id: string; name: string; count: number }[];
  };
};

class MarketplaceSearchService {
  async searchProducts(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
    let productQuery = supabase
      .from('marketplace_products')
      .select(`
        *,
        provider:marketplace_providers(
          id,
          name,
          satisfaction_score
        ),
        orders:marketplace_orders(
          rating,
          created_at
        )
      `);

    if (query) {
      productQuery = productQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.category?.length) {
      productQuery = productQuery.in('category', filters.category);
    }

    if (filters.priceRange) {
      productQuery = productQuery
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);
    }

    if (filters.providerIds?.length) {
      productQuery = productQuery.in('provider_id', filters.providerIds);
    }

    if (filters.status?.length) {
      productQuery = productQuery.in('status', filters.status);
    }

    if (filters.dateRange) {
      productQuery = productQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    if (filters.sortBy) {
      const order = filters.sortOrder || 'desc';
      switch (filters.sortBy) {
        case 'price':
          productQuery = productQuery.order('price', { ascending: order === 'asc' });
          break;
        case 'rating':
          productQuery = productQuery.order('provider(satisfaction_score)', { ascending: order === 'asc' });
          break;
        case 'date':
          productQuery = productQuery.order('created_at', { ascending: order === 'asc' });
          break;
        case 'popularity':
          productQuery = productQuery.order('orders(count)', { ascending: order === 'asc' });
          break;
      }
    }

    const { data: products, error: productsError } = await productQuery;

    if (productsError) throw productsError;

    const facets = await this.generateFacets(products);

    return {
      products,
      services: [],
      providers: [],
      totalCount: products.length,
      facets
    };
  }

  private async generateFacets(data: any[]): Promise<SearchResults['facets']> {
    const categories = data.reduce((acc: Record<string, number>, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const priceRanges = data.reduce((acc: Record<string, number>, item) => {
      const price = item.price || 0;
      let range = '0-50';
      if (price > 50 && price <= 100) range = '51-100';
      else if (price > 100 && price <= 200) range = '101-200';
      else if (price > 200) range = '200+';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    const ratings = data.reduce((acc: Record<string, number>, item) => {
      const rating = Math.floor(item.rating || 0);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const providers = data.reduce((acc: Record<string, number>, item) => {
      if (item.provider) {
        const providerId = item.provider.id;
        acc[providerId] = (acc[providerId] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      priceRanges: Object.entries(priceRanges).map(([range, count]) => ({ range, count })),
      ratings: Object.entries(ratings).map(([rating, count]) => ({ 
        rating: parseInt(rating), 
        count 
      })),
      providers: Object.entries(providers).map(([id, count]) => {
        const provider = data.find(item => item.provider?.id === id)?.provider;
        return {
          id,
          name: provider?.name || 'Unknown Provider',
          count
        };
      })
    };
  }
}

export const marketplaceSearch = new MarketplaceSearchService();
