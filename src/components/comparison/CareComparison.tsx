import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compareCareItems, type CareItem } from "@/utils/compareUtils";
import { useToast } from "@/hooks/use-toast";

export const CareComparison = () => {
  const [facilities, setFacilities] = useState<CareItem[]>([]);
  const [products, setProducts] = useState<CareItem[]>([]);
  const [comparisonResult, setComparisonResult] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesData, productsData] = await Promise.all([
          supabase.from('care_facilities').select('id, name, description, ratings'),
          supabase.from('care_products').select('id, name, description, ratings')
        ]);

        if (facilitiesData.error) throw facilitiesData.error;
        if (productsData.error) throw productsData.error;

        setFacilities(facilitiesData.data);
        setProducts(productsData.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch comparison data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Care Facilities Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="p-4 border rounded">
                <h3 className="font-semibold">{facility.name}</h3>
                <p className="text-sm text-gray-600">{facility.description}</p>
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