import { CartItem } from "@/types/cart.types";
import { apiClient, ApiException } from "@/lib/api-client";
import { toast } from "@/store/useToastStore";

export class CartService {
  static async getCart(userId: string | undefined): Promise<CartItem[]> {
    try {
      const url = userId ? `/api/cart/get?user_id=${userId}` : "/api/cart/get";
      const data = await apiClient.get<CartItem[]>(url);
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to fetch cart');
      }
      throw error;
    }
  }

  static async addItem(productId: number, variantId: number, userId: string): Promise<CartItem> {
    try {
      const data = await apiClient.post<CartItem>('/api/cart/add', {
        product_id: productId,
        variant_id: variantId,
        user_id: userId,
      });
      toast.success('Item added to cart');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to add item to cart');
      }
      throw error;
    }
  }

  static async updateItem(cartId: number, productVariantId: number, quantity: number, userId: string): Promise<void> {
    try {
      await apiClient.post('/api/cart/update', {
        cart_id: cartId,
        product_variant_id: productVariantId,
        quantity: quantity,
        user_id: userId,
      });
      if (quantity <= 0) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to update cart');
      }
      throw error;
    }
  }

  static async removeItem(cartId: number, productId: number): Promise<void> {
    try {
      await apiClient.post('/api/cart/remove', {
        cart_id: cartId,
        product_id: productId,
      });
      toast.success('Item removed from cart');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to remove item from cart');
      }
      throw error;
    }
  }

  static async clearCart(userId: string): Promise<void> {
    try {
      await apiClient.post('/api/cart/clear', { user_id: userId });
      toast.success('Cart cleared');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to clear cart');
      }
      throw error;
    }
  }
}
