import React from 'react';
import { Product } from '@/services/marketplace.service';
import { ProductCard } from './ProductCard';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onProductClick,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          <ProductCard
            product={product}
            onAddToCart={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            onAddToWishlist={(e) => {
              e.stopPropagation();
              addToWishlist(product);
            }}
          />
        </div>
      ))}
    </div>
  );
};
