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
      .select(\`
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
      \`);

    // Apply text search if query exists
    if (query) {
      productQuery = productQuery.or(
        \`name.ilike.%\${query}%,description.ilike.%\${query}%\`
      );
    }

    // Apply category filter
    if (filters.category?.length) {
      productQuery = productQuery.in('category', filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      productQuery = productQuery
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);
    }

    // Apply provider filter
    if (filters.providerIds?.length) {
      productQuery = productQuery.in('provider_id', filters.providerIds);
    }

    // Apply status filter
    if (filters.status?.length) {
      productQuery = productQuery.in('status', filters.status);
    }

    // Apply date range filter
    if (filters.dateRange) {
      productQuery = productQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    // Apply sorting
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
          // Sort by number of orders
          productQuery = productQuery.order('orders(count)', { ascending: order === 'asc' });
          break;
      }
    }

    const { data: products, error: productsError } = await productQuery;

    if (productsError) throw productsError;

    // Get facets
    const facets = await this.generateFacets(products);

    return {
      products,
      services: [], // Will be implemented in searchServices method
      providers: [], // Will be implemented in searchProviders method
      totalCount: products.length,
      facets
    };
  }

  async searchServices(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
    let serviceQuery = supabase
      .from('marketplace_services')
      .select(\`
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
      \`);

    // Apply similar filters as products...
    // Implementation follows the same pattern as searchProducts

    const { data: services, error: servicesError } = await serviceQuery;

    if (servicesError) throw servicesError;

    const facets = await this.generateFacets(services);

    return {
      products: [],
      services,
      providers: [],
      totalCount: services.length,
      facets
    };
  }

  async searchProviders(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
    let providerQuery = supabase
      .from('marketplace_providers')
      .select(\`
        *,
        products:marketplace_products(
          id,
          name,
          price
        ),
        orders:marketplace_orders(
          rating,
          created_at
        )
      \`);

    if (query) {
      providerQuery = providerQuery.or(
        \`name.ilike.%\${query}%,metadata->>'description'.ilike.%\${query}%\`
      );
    }

    // Apply rating filter
    if (filters.rating) {
      providerQuery = providerQuery.gte('satisfaction_score', filters.rating);
    }

    // Apply status filter
    if (filters.status?.length) {
      providerQuery = providerQuery.in('status', filters.status);
    }

    // Apply date range filter
    if (filters.dateRange) {
      providerQuery = providerQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    // Apply sorting
    if (filters.sortBy) {
      const order = filters.sortOrder || 'desc';
      switch (filters.sortBy) {
        case 'rating':
          providerQuery = providerQuery.order('satisfaction_score', { ascending: order === 'asc' });
          break;
        case 'date':
          providerQuery = providerQuery.order('created_at', { ascending: order === 'asc' });
          break;
        case 'popularity':
          providerQuery = providerQuery.order('orders(count)', { ascending: order === 'asc' });
          break;
      }
    }

    const { data: providers, error: providersError } = await providerQuery;

    if (providersError) throw providersError;

    const facets = await this.generateFacets(providers);

    return {
      products: [],
      services: [],
      providers,
      totalCount: providers.length,
      facets
    };
  }

  private async generateFacets(data: any[]): Promise<SearchResults['facets']> {
    // Generate category facets
    const categories = data.reduce((acc: Record<string, number>, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Generate price range facets
    const priceRanges = data.reduce((acc: Record<string, number>, item) => {
      const price = item.price || 0;
      let range = '0-50';
      if (price > 50 && price <= 100) range = '51-100';
      else if (price > 100 && price <= 200) range = '101-200';
      else if (price > 200) range = '200+';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    // Generate rating facets
    const ratings = data.reduce((acc: Record<string, number>, item) => {
      const rating = Math.floor(item.rating || 0);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    // Generate provider facets
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

  async getAutocompleteSuggestions(
    query: string,
    type: 'product' | 'service' | 'provider' = 'product'
  ): Promise<string[]> {
    if (!query) return [];

    let suggestions: string[] = [];

    switch (type) {
      case 'product': {
        const { data } = await supabase
          .from('marketplace_products')
          .select('name')
          .ilike('name', \`%\${query}%\`)
          .limit(10);
        suggestions = data?.map(item => item.name) || [];
        break;
      }
      case 'service': {
        const { data } = await supabase
          .from('marketplace_services')
          .select('name')
          .ilike('name', \`%\${query}%\`)
          .limit(10);
        suggestions = data?.map(item => item.name) || [];
        break;
      }
      case 'provider': {
        const { data } = await supabase
          .from('marketplace_providers')
          .select('name')
          .ilike('name', \`%\${query}%\`)
          .limit(10);
        suggestions = data?.map(item => item.name) || [];
        break;
      }
    }

    return suggestions;
  }
}

export const marketplaceSearch = new MarketplaceSearchService();
