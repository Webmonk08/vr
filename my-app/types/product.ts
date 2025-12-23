 

export type products = {
  id: number, // Changed from UUID to number to match variant_id (int4) in schema
  category_id: number,
  name: string,
  price: number, // numeric in DB
  weight_value: number,
  weight_unit: number,
  stock_quantity: number,
  sku: string,
  is_default: boolean,
} 

