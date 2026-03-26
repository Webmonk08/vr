-- Run this SQL in your Supabase SQL Editor to create the RPCs

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





-- 1. Create Product with Variants
CREATE OR REPLACE FUNCTION create_product_with_variants(p_name text, p_variants jsonb)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    new_product_id int;
    v_variant jsonb;
BEGIN
    -- Insert the main product
    INSERT INTO products (name)
    VALUES (p_name)
    RETURNING id INTO new_product_id;

    -- Loop through the variants JSON array and insert them
    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        INSERT INTO product_variants (
            product_id,
            price,
            weight_value,
            weight_unit,
            stock_quantity,
            description,
            sku,
            long_description,
            image,
            isdefault
        ) VALUES (
            new_product_id,
            (v_variant->>'price')::numeric,
            (v_variant->>'weight_value')::numeric,
            v_variant->>'weight_unit',
            (v_variant->>'stock_quantity')::int,
            v_variant->>'description',
            NULLIF(v_variant->>'sku', '')::uuid,
            v_variant->>'long_description',
            v_variant->'image',
            COALESCE((v_variant->>'isdefault')::boolean, false)
        );
    END LOOP;

    RETURN new_product_id;
END;
$$;

-- 2. Update Product with Variants
CREATE OR REPLACE FUNCTION update_product_with_variants(p_product_id int, p_name text, p_variants jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_variant jsonb;
    v_incoming_ids int[] := '{}';
BEGIN
    -- Update the product name
    UPDATE products
    SET name = p_name
    WHERE id = p_product_id;

    -- Extract incoming variant IDs to know which ones to keep
    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            v_incoming_ids := array_append(v_incoming_ids, (v_variant->>'id')::int);
        END IF;
    END LOOP;

    -- Delete variants that are not in the exact incoming payload
    DELETE FROM product_variants
    WHERE product_id = p_product_id
    AND (id != ALL(v_incoming_ids) OR array_length(v_incoming_ids, 1) IS NULL);

    -- Loop to insert or update
    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            -- Update existing
            UPDATE product_variants
            SET
                price = (v_variant->>'price')::numeric,
                weight_value = (v_variant->>'weight_value')::numeric,
                weight_unit = v_variant->>'weight_unit',
                stock_quantity = (v_variant->>'stock_quantity')::int,
                description = v_variant->>'description',
                sku = NULLIF(v_variant->>'sku', '')::uuid,
                long_description = v_variant->>'long_description',
                image = v_variant->'image',
                isdefault = COALESCE((v_variant->>'isdefault')::boolean, false)
            WHERE id = (v_variant->>'id')::int AND product_id = p_product_id;
        ELSE
            -- Insert new
            INSERT INTO product_variants (
                product_id,
                price,
                weight_value,
                weight_unit,
                stock_quantity,
                description,
                sku,
                long_description,
                image,
                isdefault
            ) VALUES (
                p_product_id,
                (v_variant->>'price')::numeric,
                (v_variant->>'weight_value')::numeric,
                v_variant->>'weight_unit',
                (v_variant->>'stock_quantity')::int,
                v_variant->>'description',
                NULLIF(v_variant->>'sku', '')::uuid,
                v_variant->>'long_description',
                v_variant->'image',
                COALESCE((v_variant->>'isdefault')::boolean, false)
            );
        END IF;
    END LOOP;
END;
$$;
