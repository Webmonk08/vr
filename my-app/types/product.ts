export interface StorageUnit {
  id: string | number;
  name: string;
}

export interface SKUProduct {
  product_name: string;
  variant_id: number;
  price: number;
  stock_quantity: number;
  weight_value: number;
  weight_unit: string;
  description: string;
  image: string[] | string | null;
  is_default: boolean;
}

export interface ProductVariant {
  id: number;
  price: number;
  weight: string;
  stock: number;
  shortDescription: string;
  description: string;
  storageUnitId: string | number | null;
  image: string;
  isdefault: boolean
}

export interface Product {
  id: number;
  name: string;
  variants: ProductVariant[];
}
