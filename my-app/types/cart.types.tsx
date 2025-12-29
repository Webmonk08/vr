import { Product, ProductVariant } from "./product";

export interface CartItem {
  user_id: number;
  id: number; // This will be a unique ID for the cart item itself, e.g. timestamp
  product: Product;
  variant: ProductVariant;
  quantity: number;
}




