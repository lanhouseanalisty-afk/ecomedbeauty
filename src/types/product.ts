export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  tags?: string[];
  inStock: boolean;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  badge?: "new" | "bestseller" | "limited" | "sale";
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minValue?: number;
  expiresAt?: Date;
}
