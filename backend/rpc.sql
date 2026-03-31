-- PRODUCT CREATION -- 

CREATE OR REPLACE FUNCTION create_product_with_variants(
    p_name text, 
    p_variants jsonb
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    new_product_id int;
    new_variant_id int;
    v_variant jsonb;
BEGIN
    INSERT INTO products (name) VALUES (p_name) RETURNING id INTO new_product_id;

    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        INSERT INTO product_variants (
            product_id, price, weight_value, weight_unit, 
            description, long_description, image, isdefault, stock
        ) VALUES (
            new_product_id,
            (v_variant->>'price')::numeric,
            (v_variant->>'weight_value')::numeric,
            v_variant->>'weight_unit',
            v_variant->>'description',
            v_variant->>'long_description',
            v_variant->'image',
            COALESCE((v_variant->>'isdefault')::boolean, false),
            COALESCE((v_variant->>'stock')::int, 0)
        ) RETURNING id INTO new_variant_id;
    END LOOP;

    RETURN new_product_id;
END;
$$;


-- PRODUCT UPDATION --

CREATE OR REPLACE FUNCTION update_product_with_variants(
    p_product_id int, 
    p_name text, 
    p_variants jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_variant jsonb;
    v_incoming_ids int[] := '{}';
    new_v_id int;
BEGIN
    UPDATE products SET name = p_name WHERE id = p_product_id;

    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            v_incoming_ids := array_append(v_incoming_ids, (v_variant->>'id')::int);
        END IF;
    END LOOP;

    DELETE FROM product_variants
    WHERE product_id = p_product_id
    AND (id != ALL(v_incoming_ids) OR array_length(v_incoming_ids, 1) IS NULL);

    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            UPDATE product_variants SET
                price = (v_variant->>'price')::numeric,
                weight_value = (v_variant->>'weight_value')::numeric,
                weight_unit = v_variant->>'weight_unit',
                description = v_variant->>'description',
                long_description = v_variant->>'long_description',
                image = v_variant->'image',
                isdefault = COALESCE((v_variant->>'isdefault')::boolean, false),
                stock = COALESCE((v_variant->>'stock')::int, 0)
            WHERE id = (v_variant->>'id')::int AND product_id = p_product_id;
        ELSE
            INSERT INTO product_variants (
                product_id, price, weight_value, weight_unit, 
                description, long_description, image, isdefault, stock
            ) VALUES (
                p_product_id,
                (v_variant->>'price')::numeric,
                (v_variant->>'weight_value')::numeric,
                v_variant->>'weight_unit',
                v_variant->>'description',
                v_variant->>'long_description',
                v_variant->'image',
                COALESCE((v_variant->>'isdefault')::boolean, false),
                COALESCE((v_variant->>'stock')::int, 0)
            );
        END IF;
    END LOOP;
END;
$$;
