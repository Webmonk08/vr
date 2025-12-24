import { supabase } from '@/utils/supabase';


export const getOrCreateCart = async (userId: string) => {

  const { data: existingCart, error: fetchError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single();


  if (existingCart) {
    return existingCart.id;
  }

  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (createError) throw new Error("Failed to initialize cart session");

  return newCart.id;
};


export const addToCart = async (userId: string, productId: number, qty: number) => {
  const cartId = await getOrCreateCart(userId);

  const { data, error } = await supabase.from('cart_items')
    .upsert({
      cart_id: cartId,
      product_id: productId,
      quantity: qty,
    }, { onConflict: 'cart_id, variant_id' })
    .select(`*, product_variants(*)`)
    .single();

  if (error) throw error
  return data
}
