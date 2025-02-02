import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compareCareItems, type CareItem } from "@/utils/compareUtils";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type CareFacility = Database['public']['Tables']['care_facilities']['Row'];
type CareProduct = Database['public']['Tables']['care_products']['Row'];

export const CareComparison = () => {
  const [facilities, setFacilities] = useState<CareItem[]>([]);
  const [products, setProducts] = useState<CareItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [comparisonResult, setComparisonResult] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilitiesQuery = supabase
          .from('care_facilities')
          .select('id, name, description, ratings, location, listing_type');

        const productsQuery = supabase
          .from('care_products')
          .select('id, name, description, ratings, price_range, affiliate_link');

        if (selectedCountry !== "all") {
          facilitiesQuery.eq('location->country', selectedCountry);
        }
        if (selectedState !== "all") {
          facilitiesQuery.eq('location->state', selectedState);
        }

        const [facilitiesData, productsData] = await Promise.all([
          facilitiesQuery as Promise<{ data: CareFacility[] | null; error: any }>,
          productsQuery as Promise<{ data: CareProduct[] | null; error: any }>
        ]);

        if (facilitiesData.error) throw facilitiesData.error;
        if (productsData.error) throw productsData.error;

        setFacilities(facilitiesData.data?.map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description,
          ratings: facility.ratings,
          listing_type: facility.listing_type
        })) || []);

        setProducts(productsData.data?.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          ratings: product.ratings,
          price_range: product.price_range,
          affiliate_link: product.affiliate_link
        })) || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch comparison data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast, selectedCountry, selectedState]);

  const handleCompare = (items: CareItem[]) => {
    try {
      const result = compareCareItems(items);
      setComparisonResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Comparison failed",
        variant: "destructive",
      });
    }
  };

  const handleAffiliateClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Care Facilities Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>State/Province</Label>
              <Select
                value={selectedState}
                onValueChange={setSelectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {selectedCountry === "USA" ? (
                    <>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="Florida">Florida</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Texas">Texas</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Ontario">Ontario</SelectItem>
                      <SelectItem value="Quebec">Quebec</SelectItem>
                      <SelectItem value="British Columbia">British Columbia</SelectItem>
                      <SelectItem value="Alberta">Alberta</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="p-4 border rounded">
                <h3 className="font-semibold">{facility.name}</h3>
                <p className="text-sm text-gray-600">{facility.description}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {facility.listing_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button 
            onClick={() => handleCompare(facilities)}
            className="mt-4"
          >
            Compare Facilities
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Care Products Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-4 border rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                {product.affiliate_link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAffiliateClick(product.affiliate_link!)}
                  >
                    View on Amazon
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button 
            onClick={() => handleCompare(products)}
            className="mt-4"
          >
            Compare Products
          </Button>
        </CardContent>
      </Card>

      {Object.keys(comparisonResult).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(comparisonResult).map(([id, data]: [string, any]) => (
                <div key={id} className="p-4 border rounded">
                  <h3 className="font-semibold">{data.name}</h3>
                  <p className="text-sm text-gray-600">Average Rating: {data.averageRating.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};