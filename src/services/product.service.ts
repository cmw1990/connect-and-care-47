import { supabase } from '@/lib/supabase';
import { Product, ProductCategory } from '@/types/product';

export const productService = {
  async searchProducts(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; count: number }> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%, description.ilike.%${params.query}%`);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.minPrice !== undefined) {
        query = query.gte('price', params.minPrice);
      }

      if (params.maxPrice !== undefined) {
        query = query.lte('price', params.maxPrice);
      }

      // Add pagination
      const start = (params.page || 0) * (params.limit || 10);
      query = query.range(start, start + (params.limit || 10) - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Product[],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async addToCart(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .upsert({
          user_id: userId,
          product_id: productId,
          quantity,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  async getCartItems(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock_quantity
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }
};
