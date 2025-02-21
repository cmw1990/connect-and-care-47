import React from 'react';
import Image from 'next/image';
import { Product } from '@/services/marketplace.service';
import { formatCurrency } from '@/utils/format';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const primaryImage = product.images.find(img => img.type === 'primary') || product.images[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48 w-full">
        <Image
          src={primaryImage?.url || '/images/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(product.price, product.currency)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-600">
              {product.rating?.toFixed(1) || 'N/A'} 
              {product.reviewCount ? ` (${product.reviewCount})` : ''}
            </span>
          </div>
          
          {product.status === 'active' && onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <ShoppingCartIcon className="h-4 w-4 mr-1" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
