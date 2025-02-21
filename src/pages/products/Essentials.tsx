import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Search, ShoppingCart, Star, Filter } from 'lucide-react';
import { productService } from '@/services/product.service';
import { Product, ProductCategory } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';

export default function Essentials() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    searchProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const categories = await productService.getCategories();
      setCategories(categories);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('products.essentials.errorLoadingCategories'),
        variant: 'destructive',
      });
    }
  };

  const searchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, count } = await productService.searchProducts({
        query: searchQuery,
        category: selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        page,
        limit: 12,
      });
      setProducts(data);
      setTotalCount(count);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('products.essentials.errorSearching'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('products.essentials.loginRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await productService.addToCart(user.id, productId, 1);
      toast({
        title: t('common.success'),
        description: t('products.essentials.addedToCart'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('products.essentials.errorAddingToCart'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('products.essentials.title')}</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('common.filter')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/cart')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('products.essentials.cart')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('products.essentials.findProducts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('products.essentials.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? t('common.searching') : t('common.search')}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t('products.essentials.categories')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t('products.essentials.priceRange')}</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardContent className="pt-6">
              <div className="aspect-square relative mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover rounded-lg"
                />
                {product.stock_quantity <= 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    {t('products.essentials.outOfStock')}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>{product.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.review_count})
                </span>
              </div>
              <div className="mt-2">
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-bold">${product.price}</span>
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock_quantity <= 0}
                >
                  {t('products.essentials.addToCart')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 0 || isLoading}
            onClick={() => {
              setPage(p => p - 1);
              searchProducts();
            }}
          >
            {t('common.previous')}
          </Button>
          <Button
            variant="outline"
            disabled={(page + 1) * 12 >= totalCount || isLoading}
            onClick={() => {
              setPage(p => p + 1);
              searchProducts();
            }}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {t('products.essentials.noResults')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
