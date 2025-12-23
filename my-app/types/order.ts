// order.ts

export type Order = {
  id: string; // uuid
  user_id: number; // int4
  status: string; // varchar
  total_amount: number; // numeric
  shipping_address: string; // text
  created_at: string; // timestamp
};

export type OrderItem = {
  id: number; // int4
  order_id: string; // uuid
  variant_id: number; // int4
  quantity: number;
  price_at_purchase: number; // numeric (important to freeze the price here)
};
