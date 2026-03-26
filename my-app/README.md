CREATE OR REPLACE FUNCTION get_product_by_sku(input_sku uuid)
RETURNS TABLE (
  product_name varchar,
  variant_id int4,
  price numeric,
  stock_quantity int4,
  weight_value numeric,
  weight_unit varchar,
  description text,
  image jsonb,
  is_default bool
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name AS product_name,
    pv.id AS variant_id,
    pv.price,
    pv.stock_quantity,
    pv.weight_value,
    pv.weight_unit,
    pv.description,
    pv.image,
    pv.isdefault
  FROM product_variants pv
  JOIN products p ON pv.product_id = p.id
  WHERE pv.sku = input_sku;
END;
$$;