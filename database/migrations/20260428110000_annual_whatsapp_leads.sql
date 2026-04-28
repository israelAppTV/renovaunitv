-- Persistência de interesse de compra anual via WhatsApp.

CREATE TABLE IF NOT EXISTS public.annual_whatsapp_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_slug text NOT NULL DEFAULT 'anual' CHECK (plan_slug = 'anual'),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_tax_id text NOT NULL,
  customer_phone_area text NOT NULL,
  customer_phone_number text NOT NULL,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  whatsapp_url text NOT NULL,
  message_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_annual_whatsapp_leads_created_at
  ON public.annual_whatsapp_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_whatsapp_leads_tax_id
  ON public.annual_whatsapp_leads (customer_tax_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_whatsapp_leads_email
  ON public.annual_whatsapp_leads (customer_email, created_at DESC);
