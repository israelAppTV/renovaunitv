-- Import em lote: apenas JWT service_role (chamada do backend com service role).
-- Remove dependência de auth.uid() / is_admin().

CREATE OR REPLACE FUNCTION public.import_digital_codes_batch(p_rows jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH data AS (
    SELECT
      (elem->>'product_id')::uuid AS product_id,
      trim(both from elem->>'code') AS code
    FROM jsonb_array_elements(p_rows) AS elem
  ),
  dedup AS (
    SELECT DISTINCT ON (product_id, code)
      product_id,
      code
    FROM data
    WHERE code IS NOT NULL AND trim(both from code) <> ''
    ORDER BY product_id, code
  ),
  ins AS (
    INSERT INTO public.digital_codes (product_id, code, status)
    SELECT product_id, code, 'available'::public.code_status
    FROM dedup
    ON CONFLICT (product_id, code) DO NOTHING
    RETURNING product_id
  ),
  stock_upd AS (
    UPDATE public.products p
    SET stock_count = stock_count + c.cnt
    FROM (
      SELECT product_id, count(*)::integer AS cnt
      FROM ins
      GROUP BY product_id
    ) c
    WHERE p.id = c.product_id
    RETURNING p.id
  ),
  log_ins AS (
    INSERT INTO public.import_logs (product_id, imported_by, count_success, count_failed, status, metadata)
    SELECT
      product_id,
      NULL::uuid,
      count(*)::integer,
      0,
      'completed',
      jsonb_build_object('batch', true, 'via', 'service_role')
    FROM ins
    GROUP BY product_id
    RETURNING id
  )
  SELECT jsonb_build_object(
    'attempted', (SELECT count(*) FROM dedup),
    'inserted', (SELECT count(*) FROM ins),
    'skipped', (SELECT count(*) FROM dedup) - (SELECT count(*) FROM ins)
  )
  INTO v_result
  WHERE (SELECT count(*) FROM stock_upd) >= 0
    AND (SELECT count(*) FROM log_ins) >= 0;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.import_digital_codes_batch(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_digital_codes_batch(jsonb) TO service_role;

-- Endurecer leitura anônima (site público sem cliente Supabase)
DROP POLICY IF EXISTS categories_select_anon ON public.categories;
DROP POLICY IF EXISTS products_select_anon ON public.products;
