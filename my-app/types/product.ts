export interface ProductVariant {
  id: number;
  price: number;
  weight: string;
  stock: number;
  shortDescription: string;
  description: string;
  image: string;
  isdefault: boolean;
  category: string;
  features: string[];
}

export interface Product {
  id: number;
  name: string;
  variants: ProductVariant[];
}
