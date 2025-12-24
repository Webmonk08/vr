import { create } from 'zustand'
import { Database } from '@/types/database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type CartItemWithProduct = Tables<'cart_items'> & {
  product: Tables<'products'> & {
    variant: Tables<'product_variants'>;
  };
};
export interface CartStore {
  cart: CartItemWithProduct[];
  showCart: boolean;
  addToCart: (item: CartItemWithProduct) => void;
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
        (i) => i.product_id === item.product_id
      );
      if (existingItemIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += item.quantity;
        return { cart: newCart };
      }
      return { cart: [...state.cart, item] };
    });
  },
  updateQuantity: (itemId, newQuantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      ),
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
      return total + (item.product.variant.price * item.quantity);
    }, 0);
  },
  getTotalItems: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  },
}));

