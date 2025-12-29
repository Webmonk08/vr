export interface ProductVariant {
  id: number;
  price: number;
  name: string; // e.g., '5kg', '1kg'
  stock: number;
  description: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  category_id : number;
  variants: ProductVariant[];
}

export interface CartItem {
  user_id: number
  id: number; // This will be a unique ID for the cart item itself, e.g. timestamp
  product: Product;
  variant: ProductVariant;
  quantity: number;
}
