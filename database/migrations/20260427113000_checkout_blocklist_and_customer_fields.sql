-- Fase 1 (checkout): persistência completa de dados do cliente e blocklist dinâmica.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_tax_id text,
  ADD COLUMN IF NOT EXISTS customer_phone_area text,
  ADD COLUMN IF NOT EXISTS customer_phone_number text;

CREATE INDEX IF NOT EXISTS idx_orders_customer_tax_id
  ON public.orders (customer_tax_id)
  WHERE customer_tax_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone
  ON public.orders (customer_phone_area, customer_phone_number)
  WHERE customer_phone_area IS NOT NULL AND customer_phone_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.fraud_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL CHECK (
    block_type IN ('cpf', 'email', 'ip', 'phone', 'device_fingerprint')
  ),
  value_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  reason text,
  source text,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fraud_blocklist_type_hash_active
  ON public.fraud_blocklist (block_type, value_hash, active);

CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_active_expiry
  ON public.fraud_blocklist (active, expires_at);
