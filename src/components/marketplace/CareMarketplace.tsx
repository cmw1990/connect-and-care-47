import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { marketplaceService } from '@/services/marketplace.service';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Heart,
  Award,
  ThumbsUp,
  Building2,
  Users,
  ShoppingBag,
  Briefcase,
  Scale,
} from 'lucide-react';

interface SearchFilters {
  type?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  availability?: string[];
  specialties?: string[];
  services?: string[];
  certifications?: string[];
}

interface ComparisonItem {
  id: string;
  name: string;
  type: string;
  rating: number;
  price: number;
  location: string;
  features: string[];
  reviews: number;
}

export const CareMarketplace = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useUser();
  const [activeTab, setActiveTab] = React.useState('caregivers');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [results, setResults] = React.useState<any[]>([]);
  const [comparison, setComparison] = React.useState<ComparisonItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      loadFavorites();
      performSearch();
    }
  }, [user, activeTab]);

  const loadFavorites = async () => {
    try {
      const data = await marketplaceService.getFavorites(user!.id);
      setFavorites(data.map(f => f.itemId));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await marketplaceService.search(searchQuery, {
        ...filters,
        type: activeTab,
      });
      setResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: t('error.searchFailed'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    try {
      if (favorites.includes(itemId)) {
        await marketplaceService.removeFavorite(user!.id, itemId);
        setFavorites(prev => prev.filter(id => id !== itemId));
      } else {
        await marketplaceService.addFavorite(user!.id, itemId);
        setFavorites(prev => [...prev, itemId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: t('error.favoriteToggleFailed'),
        description: t('error.tryAgainLater'),
        variant: 'destructive',
      });
    }
  };

  const addToComparison = (item: ComparisonItem) => {
    if (comparison.length >= 3) {
      toast({
        title: t('error.comparisonLimitReached'),
        description: t('error.removeItemFirst'),
        variant: 'destructive',
      });
      return;
    }
    setComparison(prev => [...prev, item]);
  };

  const removeFromComparison = (itemId: string) => {
    setComparison(prev => prev.filter(item => item.id !== itemId));
  };

  const renderSearchBar = () => (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="pl-10"
        />
      </div>
      <Button variant="outline" onClick={() => {/* Show filters modal */}}>
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
    </div>
  );

  const renderResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(item.id)
                        ? 'fill-current text-red-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {item.rating}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-400 mr-1" />
                    {item.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-400 mr-1" />
                    {item.price}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-primary mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => addToComparison(item)}>
                Compare
              </Button>
              <Button>View Details</Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderComparison = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-4">
            <div className="font-medium">Features</div>
            <div>Rating</div>
            <div>Price</div>
            <div>Location</div>
            <div>Reviews</div>
          </div>
          {comparison.map(item => (
            <div key={item.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromComparison(item.id)}
                >
                  ×
                </Button>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {item.rating}
              </div>
              <div>${item.price}</div>
              <div>{item.location}</div>
              <div>{item.reviews} reviews</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="caregivers" className="flex flex-col items-center p-3">
            <Users className="h-5 w-5" />
            <span className="mt-1">Caregivers</span>
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex flex-col items-center p-3">
            <Building2 className="h-5 w-5" />
            <span className="mt-1">Facilities</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex flex-col items-center p-3">
            <ShoppingBag className="h-5 w-5" />
            <span className="mt-1">Products</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex flex-col items-center p-3">
            <Briefcase className="h-5 w-5" />
            <span className="mt-1">Services</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {renderSearchBar()}
          {renderResults()}
          {comparison.length > 0 && renderComparison()}
        </div>
      </Tabs>
    </div>
  );
};
