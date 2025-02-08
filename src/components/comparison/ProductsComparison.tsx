
import { Button } from "@/components/ui/button";
import { Brain, DollarSign, Shield, Star, Tags } from "lucide-react";
import { CareProduct } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatUtils";
import { VerificationBadge } from "@/components/verification/VerificationBadge";

interface ProductsComparisonProps {
  products: CareProduct[];
  isAnalyzing: boolean;
  onCompare: (products: CareProduct[]) => void;
  onAffiliateClick: (link: string) => void;
}

export const ProductsComparison = ({
  products,
  isAnalyzing,
  onCompare,
  onAffiliateClick,
}: ProductsComparisonProps) => {
  const { toast } = useToast();

  const handleAffiliateClick = async (product: CareProduct) => {
    if (!product.affiliate_link) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, skipping affiliate tracking');
        onAffiliateClick(product.affiliate_link);
        return;
      }

      // Track affiliate interaction
      const { error } = await supabase
        .from('affiliate_interactions')
        .insert({
          product_id: product.id,
          interaction_type: 'click',
          affiliate_link: product.affiliate_link,
          user_id: user.id
        });

      if (error) {
        console.error('Error tracking affiliate click:', error);
      }

      // Open affiliate link
      onAffiliateClick(product.affiliate_link);
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      // Still open the link even if tracking fails
      onAffiliateClick(product.affiliate_link);
    }
  };

  const getAverageRating = (ratings?: Record<string, number> | null) => {
    if (!ratings) return 0;
    const values = Object.values(ratings);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="h-full">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{product.name}</span>
                  {product.ratings && (
                    <span className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      {getAverageRating(product.ratings).toFixed(1)}
                    </span>
                  )}
                </CardTitle>
                {product.verification_status && (
                  <div className="mt-1">
                    <VerificationBadge status={product.verification_status} />
                  </div>
                )}
                {product.price_range && (
                  <CardDescription>
                    <span className="flex items-center text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(product.price_range.min)} - {formatCurrency(product.price_range.max)}
                    </span>
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{product.description}</p>
              
              {product.specifications && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        <Tags className="h-3 w-3 mr-1" />
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {product.affiliate_link && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => handleAffiliateClick(product)}
                >
                  View Best Price
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={() => onCompare(products)}
        className="w-full mt-6"
        size="lg"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Brain className="mr-2 h-5 w-5 animate-pulse" />
            Analyzing Products...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-5 w-5" />
            Compare Products
          </>
        )}
      </Button>
    </div>
  );
};
