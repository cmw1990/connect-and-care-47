import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/services/marketplace.service';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  cartItemCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartItemCount: 0,
      
      addToCart: (product: Product, quantity = 1) => {
        const items = [...get().items];
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          items.push({ ...product, quantity });
        }

        set({
          items,
          cartItemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },

      removeFromCart: (productId: string) => {
        const items = get().items.filter(item => item.id !== productId);
        
        set({
          items,
          cartItemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const items = get().items.map(item =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0);

        set({
          items,
          cartItemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },

      clearCart: () => {
        set({
          items: [],
          cartItemCount: 0,
          total: 0,
        });
      },

      total: 0,
    }),
    {
      name: 'care-companion-cart',
    }
  )
);
