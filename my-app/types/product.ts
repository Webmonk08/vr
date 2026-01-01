export interface ProductVariant {
  id: number;
  price: number;
  name: string;
  stock: number;
  description: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  variants: ProductVariant[];
}
