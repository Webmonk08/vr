
export type Cart = {
  id: string;
  user_id: number; 
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: number; 
  cart_id: string | null; 
  variant_id: number; 
  quantity: number;
  created_at: string;
};

export type CartWithDetails = CartItem & {
  product_variants: {
    name: string;
    price: number;
    image_url: string;
  };
};
