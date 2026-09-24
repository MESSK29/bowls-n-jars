import { api } from './api';
import { Product, ProductDetail, Category, Review } from '../types';

export interface ProductFilters {
  category?: string;
  material?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  q?: string;
  featured?: boolean;
  bestseller?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const productService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await api.post<Category>('/admin/categories', data);
    return res.data;
  },

  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const res = await api.get<ProductsResponse>(`/products?${params.toString()}`);
    return res.data;
  },

  async getProduct(idOrSlug: string): Promise<ProductDetail> {
    const res = await api.get<ProductDetail>(`/products/${idOrSlug}`);
    return res.data;
  },

  async submitReview(productId: number, data: { rating: number; comment: string }): Promise<Review> {
    const res = await api.post<Review>(`/products/${productId}/reviews`, data);
    return res.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await api.post<Product>('/admin/products', data);
    return res.data;
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const res = await api.put<Product>(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },
};
