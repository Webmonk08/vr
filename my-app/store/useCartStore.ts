import { create } from 'zustand';
import { CartWithDetails } from '@/types/cart'; // Ensure this matches your file path

interface CartStore {
  cart: CartWithDetails[]; 
  showCart: boolean;
  addToCart: (item: CartWithDetails) => void;
  removeFromCart: (itemId: number) => void; 
  // Added updateQuantity method
  updateQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  setShowCart: (val: boolean) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  showCart: false,

  addToCart: (item) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (i) => i.variant_id === item.variant_id
      );

      if (existingItemIndex > -1) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += item.quantity;
        return { cart: newCart };
      }
      console.log("cart added" )
      return { cart: [...state.cart, item] };
    });
  },

  // Implementation of updateQuantity
  updateQuantity: (itemId, newQuantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, newQuantity) } // Prevents quantity from being less than 1
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
}));