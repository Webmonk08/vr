export interface ProductVariant {
  id: number;
  price: number;
  weight: string;
  stock: number;
  shortDescription: string;
  description: string;
  sku: string;
  image: string;
  isdefault: boolean
}

export interface Product {
  id: number;
  name: string;
  variants: ProductVariant[];
}
