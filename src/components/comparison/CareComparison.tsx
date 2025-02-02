import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Heart, DollarSign, Lightbulb } from "lucide-react";
import { compareCareItems } from "@/utils/compareUtils";
import { CareFacility, CareProduct, ComparisonResult } from "./types";
import { FacilitiesComparison } from "./FacilitiesComparison";
import { ProductsComparison } from "./ProductsComparison";
import { ComparisonResults } from "./ComparisonResults";

type LocationData = {
  country: string;
  state: string;
  city: string;
};

type AnalysisType = 'sentiment' | 'recommendations' | 'costBenefit' | 'trends';

export const CareComparison = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [products, setProducts] = useState<CareProduct[]>([]);
  const [comparisonResult, setComparisonResult] = useState<Record<string, ComparisonResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchData = async (country: string = "all", state: string = "all") => {
    try {
      let facilitiesQuery = supabase
        .from('care_facilities')
        .select('id, name, description, location, listing_type');

      if (country !== "all") {
        facilitiesQuery = facilitiesQuery.filter('location->country', 'eq', country);
      }
      if (state !== "all") {
        facilitiesQuery = facilitiesQuery.filter('location->state', 'eq', state);
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
        const locationData = facility.location as LocationData;
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
  }, []);

  const generateAIInsights = async (items: CareFacility[] | CareProduct[], analysisType: AnalysisType = 'recommendations') => {
    try {
      const response = await supabase.functions.invoke('care-assistant', {
        body: {
          message: `Analyze these items: ${items.map(item => item.name).join(', ')}`,
          context: "Comparison analysis",
          analysisType
        },
      });

      if (response.error) throw new Error('Failed to get AI insights');
      return response.data.reply;
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return "Unable to generate AI insights at this time.";
    }
  };

  const handleCompare = async <T extends CareFacility | CareProduct>(items: T[]) => {
    try {
      setIsAnalyzing(true);
      
      const result = compareCareItems(items);
      const enhancedResult: Record<string, ComparisonResult> = {};
      
      for (const [id, data] of Object.entries(result)) {
        const item = items.find(item => item.id === id);
        if (!item) continue;
        
        const [sentiment, recommendations, costBenefit, trends] = await Promise.all([
          generateAIInsights([item], 'sentiment'),
          generateAIInsights([item], 'recommendations'),
          generateAIInsights([item], 'costBenefit'),
          generateAIInsights([item], 'trends')
        ]);

        enhancedResult[id] = {
          name: data.name,
          averageRating: data.averageRating,
          features: data.description?.split('.').filter(Boolean) || [],
          aiInsights: recommendations,
          sentimentAnalysis: sentiment,
          costBenefitAnalysis: costBenefit,
          trendAnalysis: trends
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold">Sentiment Analysis</h3>
                <p className="text-sm text-gray-600">Emotional insights from reviews</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Personalized suggestions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Cost-Benefit Analysis</h3>
                <p className="text-sm text-gray-600">Financial insights</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Trend Prediction</h3>
                <p className="text-sm text-gray-600">Future developments</p>
              </div>
            </div>
          </Card>
        </div>

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
