import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';
import { fileService } from './file.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  stock: number;
  images: {
    id: string;
    url: string;
    type: 'primary' | 'thumbnail' | 'gallery';
  }[];
  specifications?: Record<string, any>;
  features?: string[];
  brand?: string;
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  metadata?: Record<string, any>;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  providerId: string;
  pricing: {
    amount: number;
    currency: string;
    unit: string;
    minimumUnits?: number;
  };
  availability?: {
    schedule: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
    locations: string[];
  };
  requirements?: string[];
  features?: string[];
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'booked';
}

export interface Order {
  id: string;
  userId: string;
  type: 'product' | 'service';
  items: {
    id: string;
    quantity: number;
    price: number;
    metadata?: Record<string, any>;
  }[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping?: {
    address: string;
    method: string;
    tracking?: string;
    estimatedDelivery?: string;
  };
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'refunded';
    transactionId?: string;
  };
  total: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'product' | 'service' | 'provider';
  rating: number;
  title?: string;
  content: string;
  images?: {
    id: string;
    url: string;
  }[];
  verified: boolean;
  helpful?: number;
  response?: {
    content: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

class MarketplaceService {
  async createProduct(product: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> {
    // Upload product images
    const images = await Promise.all(
      product.images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], `product_${Date.now()}`, { type: 'image/jpeg' });
        
        const fileMetadata = await fileService.uploadFile(file, 'resource', {
          purpose: 'product_image',
          type: image.type,
        });

        return {
          id: fileMetadata.id,
          url: fileMetadata.url!,
          type: image.type,
        };
      })
    );

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        currency: product.currency,
        stock: product.stock,
        images,
        specifications: product.specifications,
        features: product.features,
        brand: product.brand,
        status: product.status,
        metadata: product.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'marketplace',
      action: 'create_product',
      label: product.category,
      metadata: { price: product.price },
    });

    return data;
  }

  async searchProducts(params: {
    query?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean;
    sortBy?: 'price' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      query,
      category,
      subcategory,
      minPrice,
      maxPrice,
      brand,
      inStock,
      sortBy = 'newest',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params;

    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (subcategory) {
      dbQuery = dbQuery.eq('subcategory', subcategory);
    }

    if (minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', minPrice);
    }

    if (maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    if (brand) {
      dbQuery = dbQuery.eq('brand', brand);
    }

    if (inStock) {
      dbQuery = dbQuery.gt('stock', 0);
    }

    switch (sortBy) {
      case 'price':
        dbQuery = dbQuery.order('price', { ascending: sortOrder === 'asc' });
        break;
      case 'rating':
        dbQuery = dbQuery.order('rating', { ascending: sortOrder === 'asc' });
        break;
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: sortOrder === 'asc' });
        break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await dbQuery.range(from, to);

    if (error) throw error;

    return {
      products: data,
      total: count || 0,
      hasMore: (count || 0) > to + 1,
    };
  }

  async createService(service: Omit<Service, 'id' | 'rating' | 'reviewCount'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: service.name,
        description: service.description,
        category: service.category,
        provider_id: service.providerId,
        pricing: service.pricing,
        availability: service.availability,
        requirements: service.requirements,
        features: service.features,
        status: service.status,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'marketplace',
      action: 'create_service',
      label: service.category,
      metadata: { providerId: service.providerId },
    });

    return data;
  }

  async searchServices(params: {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    providerId?: string;
    availability?: string;
    sortBy?: 'price' | 'rating' | 'availability';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{
    services: Service[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      query,
      category,
      location,
      minPrice,
      maxPrice,
      providerId,
      availability,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params;

    let dbQuery = supabase
      .from('services')
      .select('*', { count: 'exact' });

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (location) {
      dbQuery = dbQuery.contains('availability->locations', [location]);
    }

    if (minPrice !== undefined) {
      dbQuery = dbQuery.gte('pricing->amount', minPrice);
    }

    if (maxPrice !== undefined) {
      dbQuery = dbQuery.lte('pricing->amount', maxPrice);
    }

    if (providerId) {
      dbQuery = dbQuery.eq('provider_id', providerId);
    }

    if (availability) {
      dbQuery = dbQuery.contains('availability->schedule', [{ day: availability }]);
    }

    switch (sortBy) {
      case 'price':
        dbQuery = dbQuery.order('pricing->amount', { ascending: sortOrder === 'asc' });
        break;
      case 'rating':
        dbQuery = dbQuery.order('rating', { ascending: sortOrder === 'asc' });
        break;
      case 'availability':
        dbQuery = dbQuery.order('availability->schedule', { ascending: sortOrder === 'asc' });
        break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await dbQuery.range(from, to);

    if (error) throw error;

    return {
      services: data,
      total: count || 0,
      hasMore: (count || 0) > to + 1,
    };
  }

  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    // Validate stock availability for products
    if (order.type === 'product') {
      for (const item of order.items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.id}`);
        }
      }
    }

    // Create order
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId,
        type: order.type,
        items: order.items,
        status: order.status,
        shipping: order.shipping,
        payment: order.payment,
        total: order.total,
        currency: order.currency,
        metadata: order.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Update stock for products
    if (order.type === 'product') {
      for (const item of order.items) {
        await supabase.rpc('decrease_product_stock', {
          product_id: item.id,
          quantity: item.quantity,
        });
      }
    }

    // Notify user
    await notificationService.create({
      userId: order.userId,
      type: 'order',
      title: 'Order Created',
      message: `Your order #${data.id} has been created`,
      data: { orderId: data.id },
    });

    analyticsService.trackEvent({
      category: 'marketplace',
      action: 'create_order',
      label: order.type,
      metadata: { total: order.total },
    });

    return data;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Notify user
    await notificationService.create({
      userId: order.user_id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${orderId} status has been updated to ${status}`,
      data: { orderId },
    });

    analyticsService.trackEvent({
      category: 'marketplace',
      action: 'update_order_status',
      label: status,
      metadata: { orderId },
    });
  }

  async createReview(review: Omit<Review, 'id' | 'verified' | 'helpful' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    // Upload review images if any
    let images;
    if (review.images?.length) {
      images = await Promise.all(
        review.images.map(async (image) => {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const file = new File([blob], `review_${Date.now()}`, { type: 'image/jpeg' });
          
          const fileMetadata = await fileService.uploadFile(file, 'resource', {
            purpose: 'review_image',
            userId: review.userId,
          });

          return {
            id: fileMetadata.id,
            url: fileMetadata.url!,
          };
        })
      );
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: review.userId,
        target_id: review.targetId,
        target_type: review.targetType,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images,
        verified: false,
        helpful: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Update target rating
    await this.updateTargetRating(review.targetId, review.targetType);

    analyticsService.trackEvent({
      category: 'marketplace',
      action: 'create_review',
      label: review.targetType,
      metadata: { rating: review.rating },
    });

    return data;
  }

  private async updateTargetRating(targetId: string, targetType: Review['targetType']): Promise<void> {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', targetId)
      .eq('target_type', targetType);

    if (!reviews?.length) return;

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    const table = targetType === 'product' ? 'products' :
                 targetType === 'service' ? 'services' :
                 'providers';

    await supabase
      .from(table)
      .update({
        rating: averageRating,
        review_count: reviews.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);
  }

  async markReviewHelpful(reviewId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('review_helpful')
      .insert({
        review_id: reviewId,
        user_id: userId,
      });

    if (error) throw error;

    await supabase.rpc('increment_review_helpful', {
      review_id: reviewId,
    });
  }

  async respondToReview(reviewId: string, response: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .update({
        response: {
          content: response,
          timestamp: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) throw error;
  }
}

export const marketplaceService = new MarketplaceService();
