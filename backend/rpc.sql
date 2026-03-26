-- PRODUCT CREATION -- 

CREATE OR REPLACE FUNCTION create_product_with_variants(
    p_name text, 
    p_variants jsonb, 
    p_initial_storage_id uuid -- Pass the ID of the Unit (Unit A or B)
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
        -- Insert into variants (No stock_quantity here anymore)
        INSERT INTO product_variants (
            product_id, price, weight_value, weight_unit, 
            description, long_description, image, isdefault
        ) VALUES (
            new_product_id,
            (v_variant->>'price')::numeric,
            (v_variant->>'weight_value')::numeric,
            v_variant->>'weight_unit',
            v_variant->>'description',
            v_variant->>'long_description',
            v_variant->'image',
            COALESCE((v_variant->>'isdefault')::boolean, false)
        ) RETURNING id INTO new_variant_id;

        -- Initialize stock in the inventory table
        INSERT INTO inventory (variant_id, storage_unit_id, quantity)
        VALUES (new_variant_id, p_initial_storage_id, COALESCE((v_variant->>'stock_quantity')::int, 0));
    END LOOP;

    RETURN new_product_id;
END;
$$;


-- PRODUCT UPDATION --

CREATE OR REPLACE FUNCTION update_product_with_variants(
    p_product_id int, 
    p_name text, 
    p_variants jsonb,
    p_storage_unit_id uuid -- Required for new variants added during update
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_variant jsonb;
    v_incoming_ids int[] := '{}';
    new_v_id int;
BEGIN
    -- 1. Update the product name
    UPDATE products SET name = p_name WHERE id = p_product_id;

    -- 2. Extract incoming IDs to identify what to keep
    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            v_incoming_ids := array_append(v_incoming_ids, (v_variant->>'id')::int);
        END IF;
    END LOOP;

    -- 3. Delete variants (and their inventory) not in the payload
    DELETE FROM product_variants
    WHERE product_id = p_product_id
    AND (id != ALL(v_incoming_ids) OR array_length(v_incoming_ids, 1) IS NULL);

    -- 4. Loop to Insert or Update
    FOR v_variant IN SELECT * FROM jsonb_array_elements(p_variants)
    LOOP
        IF (v_variant->>'id') IS NOT NULL THEN
            -- UPDATE EXISTING
            UPDATE product_variants SET
                price = (v_variant->>'price')::numeric,
                weight_value = (v_variant->>'weight_value')::numeric,
                weight_unit = v_variant->>'weight_unit',
                description = v_variant->>'description',
                long_description = v_variant->>'long_description',
                image = v_variant->'image',
                isdefault = COALESCE((v_variant->>'isdefault')::boolean, false)
            WHERE id = (v_variant->>'id')::int AND product_id = p_product_id;
            
            -- Update stock for this variant in the specific unit
            INSERT INTO inventory (variant_id, storage_unit_id, quantity)
            VALUES ((v_variant->>'id')::int, p_storage_unit_id, (v_variant->>'stock_quantity')::int)
            ON CONFLICT (variant_id, storage_unit_id) 
            DO UPDATE SET quantity = EXCLUDED.quantity;

        ELSE
            -- INSERT NEW VARIANT
            INSERT INTO product_variants (
                product_id, price, weight_value, weight_unit, 
                description, long_description, image, isdefault
            ) VALUES (
                p_product_id,
                (v_variant->>'price')::numeric,
                (v_variant->>'weight_value')::numeric,
                v_variant->>'weight_unit',
                v_variant->>'description',
                v_variant->>'long_description',
                v_variant->'image',
                COALESCE((v_variant->>'isdefault')::boolean, false)
            ) RETURNING id INTO new_v_id;

            -- Initialize inventory for the new variant
            INSERT INTO inventory (variant_id, storage_unit_id, quantity)
            VALUES (new_v_id, p_storage_unit_id, COALESCE((v_variant->>'stock_quantity')::int, 0));
        END IF;
    END LOOP;
END;
$$;


-- GET PRODUCTS/STOCKS FOR A SPECIFIC STORAGE UNIT

CREATE OR REPLACE FUNCTION get_stocks_per_storage_unit(p_storage_unit_id uuid)
RETURNS TABLE (
  product_name varchar,
  variant_id int4,
  price numeric,
  stock_quantity int,
  weight_value numeric,
  weight_unit varchar,
  description text,
  image jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    pv.id,
    pv.price,
    inv.quantity as stock_quantity,
    pv.weight_value,
    pv.weight_unit,
    pv.description,
    pv.image
  FROM inventory inv
  JOIN product_variants pv ON inv.variant_id = pv.id
  JOIN products p ON pv.product_id = p.id
  WHERE inv.storage_unit_id = p_storage_unit_id
    AND inv.quantity > 0;
END;
$$;



-- PRODUCT TRANSFER FROM ONE SKU TO ANOTHER -- 

CREATE OR REPLACE FUNCTION transfer_product_stock(
    p_variant_id int,
    p_from_unit_id uuid,
    p_to_unit_id uuid,
    p_transfer_qty int
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. Check if source has enough stock
    IF NOT EXISTS (
        SELECT 1 FROM inventory 
        WHERE variant_id = p_variant_id AND storage_unit_id = p_from_unit_id AND quantity >= p_transfer_qty
    ) THEN
        RAISE EXCEPTION 'Insufficient stock in source unit';
    END IF;

    -- 2. Deduct from source
    UPDATE inventory 
    SET quantity = quantity - p_transfer_qty
    WHERE variant_id = p_variant_id AND storage_unit_id = p_from_unit_id;

    -- 3. Add to destination (UPSERT)
    INSERT INTO inventory (variant_id, storage_unit_id, quantity)
    VALUES (p_variant_id, p_to_unit_id, p_transfer_qty)
    ON CONFLICT (variant_id, storage_unit_id) 
    DO UPDATE SET 
        quantity = inventory.quantity + EXCLUDED.quantity,
        last_updated = now();
END;
$$;