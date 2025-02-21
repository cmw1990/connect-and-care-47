import React from 'react';
import { marketplaceSearch, SearchFilters } from '@/services/marketplace-search.service';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { Slider } from '@/components/ui/Slider';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

export const MarketplaceSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState<'product' | 'service' | 'provider'>('product');
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [showFilters, setShowFilters] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFacets, setSelectedFacets] = React.useState<{
    categories: string[];
    priceRanges: string[];
    ratings: number[];
    providers: string[];
  }>({
    categories: [],
    priceRanges: [],
    ratings: [],
    providers: []
  });

  const performSearch = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let searchResults;
      switch (searchType) {
        case 'product':
          searchResults = await marketplaceSearch.searchProducts(searchQuery, filters);
          break;
        case 'service':
          searchResults = await marketplaceSearch.searchServices(searchQuery, filters);
          break;
        case 'provider':
          searchResults = await marketplaceSearch.searchProviders(searchQuery, filters);
          break;
      }
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchType, filters]);

  const debouncedSearch = React.useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const updateSuggestions = React.useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      const results = await marketplaceSearch.getAutocompleteSuggestions(query, searchType);
      setSuggestions(results);
    }, 200),
    [searchType]
  );

  React.useEffect(() => {
    if (searchQuery) {
      debouncedSearch();
      updateSuggestions(searchQuery);
    } else {
      setResults(null);
      setSuggestions([]);
    }
  }, [searchQuery, searchType, filters]);

  const handleFilterChange = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleFacetSelection = (type: keyof typeof selectedFacets, value: string | number) => {
    setSelectedFacets(prev => {
      const updated = { ...prev };
      const array = [...updated[type]];
      const index = array.indexOf(value as never);
      
      if (index === -1) {
        array.push(value as never);
      } else {
        array.splice(index, 1);
      }
      
      updated[type] = array;
      return updated;
    });

    // Update filters based on facet selection
    switch (type) {
      case 'categories':
        handleFilterChange({ category: selectedFacets.categories });
        break;
      case 'ratings':
        handleFilterChange({ rating: Math.min(...selectedFacets.ratings) });
        break;
      case 'providers':
        handleFilterChange({ providerIds: selectedFacets.providers });
        break;
    }
  };

  const renderSearchResults = () => {
    if (!results) return null;

    const items = searchType === 'product' ? results.products :
      searchType === 'service' ? results.services :
      results.providers;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Found {results.totalCount} results
          </p>
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
            className="w-40"
          >
            <option value="">Sort by</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="date">Date</option>
            <option value="popularity">Popularity</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Facets sidebar */}
          <div className="space-y-6">
            {results.facets.categories.length > 0 && (
              <Card className="p-4">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {results.facets.categories.map(category => (
                    <div key={category.name} className="flex items-center">
                      <Checkbox
                        checked={selectedFacets.categories.includes(category.name)}
                        onChange={() => handleFacetSelection('categories', category.name)}
                      />
                      <span className="ml-2">{category.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        ({category.count})
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {results.facets.ratings.length > 0 && (
              <Card className="p-4">
                <h3 className="font-medium mb-2">Ratings</h3>
                <div className="space-y-2">
                  {results.facets.ratings.map(rating => (
                    <div key={rating.rating} className="flex items-center">
                      <Checkbox
                        checked={selectedFacets.ratings.includes(rating.rating)}
                        onChange={() => handleFacetSelection('ratings', rating.rating)}
                      />
                      <span className="ml-2">{rating.rating}+ Stars</span>
                      <span className="ml-auto text-sm text-gray-500">
                        ({rating.count})
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {searchType !== 'provider' && results.facets.providers.length > 0 && (
              <Card className="p-4">
                <h3 className="font-medium mb-2">Providers</h3>
                <div className="space-y-2">
                  {results.facets.providers.map(provider => (
                    <div key={provider.id} className="flex items-center">
                      <Checkbox
                        checked={selectedFacets.providers.includes(provider.id)}
                        onChange={() => handleFacetSelection('providers', provider.id)}
                      />
                      <span className="ml-2">{provider.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        ({provider.count})
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Results grid */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.provider && (
                        <p className="text-sm text-gray-500">
                          by {item.provider.name}
                        </p>
                      )}
                    </div>
                    {item.status && (
                      <Badge>{item.status}</Badge>
                    )}
                  </div>
                  
                  {item.price && (
                    <p className="mt-2 text-lg font-semibold">
                      ${item.price.toFixed(2)}
                    </p>
                  )}

                  {item.satisfaction_score && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-500">Rating:</span>
                      <span className="ml-1 font-medium">
                        {item.satisfaction_score.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {item.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="w-40"
          >
            <option value="product">Products</option>
            <option value="service">Services</option>
            <option value="provider">Providers</option>
          </Select>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={[
                      filters.priceRange?.min || 0,
                      filters.priceRange?.max || 1000
                    ]}
                    onChange={([min, max]) => handleFilterChange({
                      priceRange: { min, max }
                    })}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>${filters.priceRange?.min || 0}</span>
                    <span>${filters.priceRange?.max || 1000}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <DateRangePicker
                  value={[
                    filters.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    filters.dateRange?.end || new Date()
                  ]}
                  onChange={([start, end]) => handleFilterChange({
                    dateRange: { start, end }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    status: e.target.value ? [e.target.value] : undefined
                  })}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        renderSearchResults()
      )}
    </div>
  );
};
