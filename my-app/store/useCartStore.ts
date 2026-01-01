

import { create } from "zustand";
import { CartItem } from "@/types/cart.types";

export interface CartStore {
  cart: CartItem[];
  showCart: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  setShowCart: (val: boolean) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}



export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  showCart: false,
  addToCart: (item) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (i) => i.product.id === item.product.id && i.variant.id === item.variant.id
      );
      if (existingItemIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += item.quantity;
        return { cart: newCart };
      }
      return { cart: [...state.cart, { ...item, id: Date.now() }] };
    });
  },
  updateQuantity: (itemId, newQuantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      ).filter(item => item.quantity > 0),
    }));
  },
  removeFromCart: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    }));
  },
  clearCart: () => set({ cart: [] }),
  setShowCart: (val) => set({ showCart: val }),
  getTotalPrice: () => {
    const state = get();
    return state.cart.reduce((total, item) => {
      return total + item.variant.price * item.quantity;
    }, 0);
  },
  getTotalItems: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  },
}));
