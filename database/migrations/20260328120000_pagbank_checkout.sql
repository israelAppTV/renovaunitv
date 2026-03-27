-- PagBank: slugs em produtos, pedido com refs externas, idempotência de webhook, RPC de fulfillment.

-- 1) Slug em produtos (checkout resolve por slug)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique
  ON public.products (slug)
  WHERE slug IS NOT NULL;

-- Atribui slugs aos produtos UniTV já existentes (ids estáveis no projeto atual)
UPDATE public.products
SET slug = 'mensal', updated_at = now()
WHERE id = '3e3ace11-a0eb-4aab-a838-7973fb663e73' AND slug IS NULL;

UPDATE public.products
SET slug = 'anual', updated_at = now()
WHERE id = '1d7a50b5-5c3f-4835-9bbf-f77162f0c764' AND slug IS NULL;

-- Preços alinhados à home (centavos)
UPDATE public.products
SET price = 2490, updated_at = now()
WHERE id = '3e3ace11-a0eb-4aab-a838-7973fb663e73';

UPDATE public.products
SET price = 17990, updated_at = now()
WHERE id = '1d7a50b5-5c3f-4835-9bbf-f77162f0c764';

-- 2) Colunas PagBank em orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pagbank_checkout_id text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pagbank_order_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pagbank_checkout_id
  ON public.orders (pagbank_checkout_id)
  WHERE pagbank_checkout_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_pagbank_order_id
  ON public.orders (pagbank_order_id)
  WHERE pagbank_order_id IS NOT NULL;

-- 3) Idempotência de webhooks
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'pagbank',
  idempotency_key text NOT NULL,
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_webhook_events_idempotency_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_order
  ON public.payment_webhook_events (order_id);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Sem políticas: apenas service_role / postgres acessam via backend

-- 4) Fulfillment atômico (service_role apenas)
CREATE OR REPLACE FUNCTION public.fulfill_order_pagbank_payment(
  p_order_id uuid,
  p_idempotency_key text,
  p_charge_id text,
  p_payment_method text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted int;
  v_order public.orders%ROWTYPE;
  v_item public.order_items%ROWTYPE;
  v_code_id uuid;
  v_code text;
BEGIN
  IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found';
  END IF;

  IF v_order.status IS DISTINCT FROM 'pending' THEN
    IF v_order.status IN ('paid', 'delivering', 'delivered') THEN
      RETURN jsonb_build_object('ok', true, 'duplicate', true, 'reason', 'order_already_processed');
    END IF;
    RAISE EXCEPTION 'invalid order status: %', v_order.status;
  END IF;

  INSERT INTO public.payment_webhook_events (provider, idempotency_key, order_id)
  VALUES ('pagbank', p_idempotency_key, p_order_id)
  ON CONFLICT (idempotency_key) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted = 0 THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;

  SELECT * INTO v_item
  FROM public.order_items
  WHERE order_id = p_order_id
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order has no items';
  END IF;

  UPDATE public.digital_codes dc
  SET
    status = 'used'::public.code_status,
    used_by_order = p_order_id,
    used_at = now(),
    updated_at = now()
  WHERE dc.id = (
      SELECT d.id
      FROM public.digital_codes d
      WHERE d.product_id = v_item.product_id
        AND d.status = 'available'::public.code_status
      ORDER BY d.created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
  RETURNING dc.id, dc.code INTO v_code_id, v_code;

  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'out_of_stock';
  END IF;

  UPDATE public.order_items
  SET
    digital_code_id = v_code_id,
    updated_at = now()
  WHERE id = v_item.id;

  UPDATE public.products
  SET
    stock_count = GREATEST(0, stock_count - 1),
    updated_at = now()
  WHERE id = v_item.product_id;

  UPDATE public.orders
  SET
    status = 'delivered'::public.order_status,
    payment_method = COALESCE(p_payment_method, payment_method),
    payment_id = p_charge_id
  WHERE id = p_order_id;

  INSERT INTO public.delivery_logs (
    order_id,
    order_item_id,
    digital_code_id,
    channel,
    metadata
  )
  VALUES (
    p_order_id,
    v_item.id,
    v_code_id,
    'email',
    jsonb_build_object('provider', 'pagbank', 'charge_id', p_charge_id)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'digital_code_id', v_code_id,
    'code', v_code
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_order_pagbank_payment(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_order_pagbank_payment(uuid, text, text, text) TO service_role;
