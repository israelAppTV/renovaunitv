-- Fase 1 antifraude: auditoria de login admin e decisões de risco por pedido.

CREATE TABLE IF NOT EXISTS public.admin_auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text,
  user_agent text,
  success boolean NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_auth_events_created_at
  ON public.admin_auth_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_auth_events_ip_created_at
  ON public.admin_auth_events (ip_address, created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_risk_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_id text,
  decision text NOT NULL CHECK (decision IN ('auto_fulfill', 'under_review')),
  risk_score integer NOT NULL DEFAULT 0,
  reasons text[] NOT NULL DEFAULT '{}',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_risk_reviews_order
  ON public.order_risk_reviews (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_risk_reviews_decision
  ON public.order_risk_reviews (decision, created_at DESC);
