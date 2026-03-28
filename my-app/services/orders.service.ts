import { apiClient } from "@/lib/api-client";

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_id: number;
  quantity: number;
  price_at_purchase: number;
  weight?: string;
  image?: string[];
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  shipping_address: string;
  phone_no: string;
  items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export interface CreateOrderInput {
  user_id: string;
  shipping_address: string;
  phone_no: string;
  items: {
    product_id: number;
    variant_id: number;
    quantity: number;
    price_at_purchase: number;
  }[];
}

export class OrdersService {
  static async getAll(): Promise<Order[]> {
    try {
      const data = await apiClient.get<Order[]>("/api/orders/getAll");
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getByUser(userId: string): Promise<Order[]> {
    try {
      const data = await apiClient.get<Order[]>(
        `/api/orders/user?user_id=${userId}`
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async create(input: CreateOrderInput): Promise<Order> {
    try {
      const data = await apiClient.post<Order>("/api/orders/create", input);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await apiClient.put(`/api/orders/update-status/${orderId}`, { status });
    } catch (error) {
      throw error;
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/orders/delete/${orderId}`);
    } catch (error) {
      throw error;
    }
  }
}
