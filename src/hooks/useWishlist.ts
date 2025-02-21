import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/services/marketplace.service';

interface WishlistStore {
  items: Product[];
  wishlistCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistCount: 0,
      
      addToWishlist: (product: Product) => {
        const items = [...get().items];
        if (!items.some(item => item.id === product.id)) {
          items.push(product);
        }
        
        set({
          items,
          wishlistCount: items.length,
        });
      },

      removeFromWishlist: (productId: string) => {
        const items = get().items.filter(item => item.id !== productId);
        
        set({
          items,
          wishlistCount: items.length,
        });
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.id === productId);
      },

      clearWishlist: () => {
        set({
          items: [],
          wishlistCount: 0,
        });
      },
    }),
    {
      name: 'care-companion-wishlist',
    }
  )
);
