export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id?: number;
  category?: Category;
  material?: string;
  color?: string;
  dimensions?: string;
  capacity?: string;
  stock: number;
  images: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  care_instructions?: string;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id?: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductDetail extends Product {
  reviews: Review[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address_json?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  house_flat: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  payment_method: 'stripe' | 'razorpay' | 'cod' | 'upi';
  payment_status: 'paid' | 'pending' | 'failed';
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

export interface AdminStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  low_stock_count: number;
  recent_orders: Order[];
}
