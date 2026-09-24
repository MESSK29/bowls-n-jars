import { api } from './api';
import { Order, ShippingAddress, AdminStats, Product } from '../types';

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  shipping_address: ShippingAddress;
  payment_method: 'stripe' | 'razorpay' | 'cod' | 'upi';
  notes?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post<Order>('/orders', payload);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>('/orders');
    return res.data;
  },

  async getOrderDetail(idOrNumber: string): Promise<Order> {
    const res = await api.get<Order>(`/orders/${idOrNumber}`);
    return res.data;
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>('/admin/orders');
    return res.data;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const res = await api.patch<Order>(`/admin/orders/${orderId}/status`, { status });
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
