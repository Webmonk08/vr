import { CartItem } from "@/types/cart.types";

export class CartService {
  static async getCart(userId: string | undefined): Promise<CartItem[]> {
    const url = userId ? `/api/cart/get?user_id=${userId}` : '/api/cart/get';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }
    return response.json();
  }

  static async addItem(productId: number, variantId: number, userId: string): Promise<CartItem> {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, variant_id: variantId, user_id: userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }
    return response.json();
  }

  static async updateItem(cartId: number, productVariantId: number, quantity: number, userId: string): Promise<void> {
    const response = await fetch("/api/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_id: cartId, product_variant_id: productVariantId, quantity: quantity, user_id: userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to update item quantity");
    }
  }

  static async clearCart(userId: string): Promise<void> {
    const response = await fetch("/api/cart/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to clear cart");
    }
  }
}
