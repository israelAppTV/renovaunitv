-- Permite registrar leads de WhatsApp para plano mensal e anual.

ALTER TABLE public.annual_whatsapp_leads
  DROP CONSTRAINT IF EXISTS annual_whatsapp_leads_plan_slug_check;

ALTER TABLE public.annual_whatsapp_leads
  ALTER COLUMN plan_slug DROP DEFAULT;

ALTER TABLE public.annual_whatsapp_leads
  ADD CONSTRAINT annual_whatsapp_leads_plan_slug_check
  CHECK (plan_slug IN ('mensal', 'anual'));
