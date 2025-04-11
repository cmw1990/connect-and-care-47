
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LocationData } from '@/types/comparison';
import { castQueryResult } from '@/utils/supabaseHelpers';

interface CareFacility {
  id: string;
  name: string;
  description: string;
  location: string;
  amenities?: string[];
  services?: string[];
  price_range?: string;
  rating?: number;
}

interface CareProduct {
  id: string;
  name: string;
  description: string;
  features?: string[];
  price?: number;
  rating?: number;
  image_url?: string;
  affiliate_link?: string;
}

interface CareComparisonProps {
  type: 'facilities' | 'products';
  items: string[];
}

export function CareComparison({ type, items }: CareComparisonProps) {
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [products, setProducts] = useState<CareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (type === 'facilities') {
      fetchFacilities();
    } else {
      fetchProducts();
    }
  }, [type, items]);

  const fetchFacilities = async () => {
    try {
      // Mock data for facilities
      const mockFacilities: CareFacility[] = [
        {
          id: '1',
          name: 'Sunrise Senior Living',
          description: 'A comfortable and secure environment for seniors',
          location: 'Boston, MA',
          amenities: ['Swimming Pool', 'Garden', 'Library'],
          services: ['24/7 Care', 'Physical Therapy', 'Memory Care'],
          price_range: '$3,500 - $5,500/month',
          rating: 4.7
        },
        {
          id: '2',
          name: 'Golden Years Retirement Home',
          description: 'Luxury retirement community with full care services',
          location: 'Cambridge, MA',
          amenities: ['Fitness Center', 'Restaurant', 'Movie Theater'],
          services: ['Medical Care', 'Daily Activities', 'Transportation'],
          price_range: '$4,000 - $6,000/month',
          rating: 4.5
        }
      ];
      
      setFacilities(mockFacilities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast({
        title: "Error",
        description: "Failed to load care facilities",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Mock data for products
      const mockProducts: CareProduct[] = [
        {
          id: '1',
          name: 'MedMinder Pill Dispenser',
          description: 'Automated pill dispenser with reminder alerts',
          features: ['Scheduled Alerts', 'Lock System', 'Mobile App'],
          price: 89.99,
          rating: 4.8,
          image_url: '/product-1.jpg',
          affiliate_link: 'https://example.com/medminder'
        },
        {
          id: '2',
          name: 'CareBuddy Personal Alert System',
          description: 'Wearable emergency alert device for seniors',
          features: ['Fall Detection', 'GPS Tracking', 'Two-way Communication'],
          price: 129.99,
          rating: 4.6,
          image_url: '/product-2.jpg',
          affiliate_link: 'https://example.com/carebuddy'
        }
      ];
      
      setProducts(mockProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load care products",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCompare = () => {
    // This would integrate with an AI service to provide comparison
    toast({
      title: "Comparison Generated",
      description: "AI-powered comparison has been created",
    });
  };

  const parseLocation = (locationStr: string): LocationData => {
    // In a real app, this would properly parse the location string
    // For now, just a simple implementation
    const parts = locationStr.split(', ');
    return {
      city: parts[0] || '',
      state: parts[1] || '',
      country: 'USA'
    } as LocationData;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'facilities' ? 'Compare Care Facilities' : 'Compare Care Products'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'facilities' && facilities.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{facility.description}</p>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Location:</div>
                      <p className="text-sm text-muted-foreground">{facility.location}</p>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Price Range:</div>
                      <p className="text-sm text-muted-foreground">{facility.price_range}</p>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Rating:</div>
                      <p className="text-sm">{facility.rating}/5</p>
                    </div>
                    {facility.services && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Services:</div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {facility.services.map((service, index) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCompare}>Generate AI Comparison</Button>
            </div>
          </div>
        )}

        {type === 'products' && products.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Price:</div>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Rating:</div>
                      <p className="text-sm">{product.rating}/5</p>
                    </div>
                    {product.features && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Features:</div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          if (product.affiliate_link) {
                            window.open(product.affiliate_link, '_blank');
                          }
                        }}
                      >
                        View Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCompare}>Generate AI Comparison</Button>
            </div>
          </div>
        )}

        {((type === 'facilities' && facilities.length === 0) || 
           (type === 'products' && products.length === 0)) && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No items found to compare. Please select two or more items.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
