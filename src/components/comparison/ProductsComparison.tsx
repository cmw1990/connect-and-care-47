import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { CareProduct } from "./types";

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
  return (
    <div>
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
                onClick={() => onAffiliateClick(product.affiliate_link!)}
              >
                View on Amazon
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button 
        onClick={() => onCompare(products)}
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
    </div>
  );
};