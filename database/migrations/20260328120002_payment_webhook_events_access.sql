-- Tabela só para backend (RPC + service_role): RLS desligado e grants restritos.
ALTER TABLE public.payment_webhook_events DISABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.payment_webhook_events FROM PUBLIC;
GRANT SELECT, INSERT, DELETE ON public.payment_webhook_events TO service_role;
