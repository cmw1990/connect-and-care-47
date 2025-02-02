import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compareCareItems } from "@/utils/compareUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart2, Brain, Image } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Location = {
  country: string;
  state: string;
};

interface CareFacility {
  id: string;
  name: string;
  description: string | null;
  location: Location | null;
  listing_type: string | null;
}

interface CareProduct {
  id: string;
  name: string;
  description: string | null;
  affiliate_link: string | null;
}

interface ComparisonResult {
  id: string;
  name: string;
  averageRating: number;
  features?: string[];
  aiInsights?: string;
}

export const CareComparison = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<CareFacility[]>([]);
  const [products, setProducts] = useState<CareProduct[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [comparisonResult, setComparisonResult] = useState<Record<string, ComparisonResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilitiesQuery = supabase
          .from('care_facilities')
          .select('id, name, description, location, listing_type');

        if (selectedCountry !== "all") {
          facilitiesQuery.eq('location->country', selectedCountry);
        }
        if (selectedState !== "all") {
          facilitiesQuery.eq('location->state', selectedState);
        }

        const [facilitiesResponse, productsResponse] = await Promise.all([
          facilitiesQuery,
          supabase
            .from('care_products')
            .select('id, name, description, affiliate_link')
        ]);

        if (facilitiesResponse.error) throw facilitiesResponse.error;
        if (productsResponse.error) throw productsResponse.error;

        const transformedFacilities = facilitiesResponse.data.map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location as Location,
          listing_type: facility.listing_type
        }));

        const transformedProducts = productsResponse.data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          affiliate_link: product.affiliate_link
        }));

        setFacilities(transformedFacilities);
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch comparison data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast, selectedCountry, selectedState]);

  const generateAIInsights = async (items: any[]) => {
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
      
      // Generate AI insights for each item
      const enhancedResult: Record<string, ComparisonResult> = {};
      for (const [id, data] of Object.entries(result)) {
        const aiInsight = await generateAIInsights([items.find(item => item.id === id)]);
        enhancedResult[id] = {
          ...data,
          aiInsights: aiInsight,
          features: data.description?.split('.').filter(Boolean) || []
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

  const renderComparisonChart = (data: Record<string, ComparisonResult>) => {
    const chartData = Object.entries(data).map(([id, item]) => ({
      name: item.name,
      rating: item.averageRating
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="rating" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
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
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                'Compare Facilities'
              )}
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
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                'Compare Products'
              )}
            </Button>
          </CardContent>
        </Card>

        {Object.keys(comparisonResult).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Comparison Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderComparisonChart(comparisonResult)}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {Object.entries(comparisonResult).map(([id, data]) => (
                  <div key={id} className="p-4 border rounded">
                    <h3 className="font-semibold">{data.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Rating: {data.averageRating.toFixed(1)}
                    </p>
                    {data.features && data.features.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Key Features:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {data.features.slice(0, 3).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.aiInsights && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">AI Insights:</h4>
                        <p className="text-sm text-gray-600">{data.aiInsights}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
