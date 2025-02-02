import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { compareCareItems } from "@/utils/compareUtils";
import { CareFacility, CareProduct, ComparisonResult } from "./types";
import { FacilitiesComparison } from "./FacilitiesComparison";
import { ProductsComparison } from "./ProductsComparison";
import { ComparisonResults } from "./ComparisonResults";

export const CareComparison = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [products, setProducts] = useState<CareProduct[]>([]);
  const [comparisonResult, setComparisonResult] = useState<Record<string, ComparisonResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchData = async (country: string = "all", state: string = "all") => {
    try {
      const facilitiesQuery = supabase
        .from('care_facilities')
        .select('id, name, description, location, listing_type');

      if (country !== "all") {
        facilitiesQuery.eq('location->country', country);
      }
      if (state !== "all") {
        facilitiesQuery.eq('location->state', state);
      }

      const [facilitiesResponse, productsResponse] = await Promise.all([
        facilitiesQuery,
        supabase
          .from('care_products')
          .select('id, name, description, affiliate_link')
      ]);

      if (facilitiesResponse.error) throw facilitiesResponse.error;
      if (productsResponse.error) throw productsResponse.error;

      const transformedFacilities: CareFacility[] = facilitiesResponse.data.map(facility => {
        const locationData = facility.location as { country?: string; state?: string; city?: string } | null;
        return {
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: {
            country: locationData?.country || '',
            state: locationData?.state || '',
            city: locationData?.city || ''
          },
          listing_type: facility.listing_type
        };
      });

      setFacilities(transformedFacilities);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comparison data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  const generateAIInsights = async (items: CareFacility[] | CareProduct[]) => {
    try {
      const response = await fetch('/functions/v1/care-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          message: `Compare these items and provide insights: ${items.map(item => item.name).join(', ')}`,
          context: "Comparison analysis"
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI insights');
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return "Unable to generate AI insights at this time.";
    }
  };

  const handleCompare = async (items: CareFacility[] | CareProduct[]) => {
    try {
      setIsAnalyzing(true);
      
      const result = compareCareItems(items);
      
      const enhancedResult: Record<string, ComparisonResult> = {};
      for (const [id, data] of Object.entries(result)) {
        const item = items.find(item => item.id === id);
        if (!item) continue;
        
        const aiInsight = await generateAIInsights([item]);
        enhancedResult[id] = {
          name: data.name,
          averageRating: data.averageRating,
          features: data.description?.split('.').filter(Boolean) || [],
          aiInsights: aiInsight
        };
      }

      setComparisonResult(enhancedResult);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Comparison failed",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAffiliateClick = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Care Facilities Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <FacilitiesComparison
              facilities={facilities}
              isAnalyzing={isAnalyzing}
              onCompare={handleCompare}
              onLocationChange={fetchData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Care Products Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductsComparison
              products={products}
              isAnalyzing={isAnalyzing}
              onCompare={handleCompare}
              onAffiliateClick={handleAffiliateClick}
            />
          </CardContent>
        </Card>

        {Object.keys(comparisonResult).length > 0 && (
          <ComparisonResults results={comparisonResult} />
        )}
      </div>
    </div>
  );
};
