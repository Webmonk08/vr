import { CartItem } from "@/types/cart.types";

export class CartService {
  static async getCart(userId: string | undefined): Promise<CartItem[]> {
    const url = userId ? `/api/cart/get?user_id=${userId}` : "api/cart/get";
    const response = await fetch(url);
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to fetch cart");
    }
    console.log("response", data)

    return data;
  }

  static async addItem(productId: number, variantId: number, userId: string): Promise<CartItem> {
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, variant_id: variantId, user_id: userId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to add item to cart");
    }
    return data;
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
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || "Failed to update item quantity");
    }
  }

  static async removeItem(cartId: number, productId: number): Promise<void> {
    const response = await fetch("/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart_id: cartId, product_id: productId }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || "Failed to remove item from cart");
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
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || "Failed to clear cart");
    }
  }
}
