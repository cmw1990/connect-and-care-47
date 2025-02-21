export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  rating: number;
  review_count: number;
  brand: string;
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parent_id?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
