# Runbook de Rotacao de Segredos

Este projeto usa segredos sensiveis para pagamento, e-mail e admin. Sempre que houver suspeita de vazamento, rotacione imediatamente.

## Segredos a rotacionar

- `SUPABASE_SERVICE_ROLE_KEY`
- `DEPIX_API_KEY`
- `DEPIX_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ADMIN_SESSION_SECRET`
- `ADMIN_PASSWORD_BCRYPT_HASH` (trocar senha admin e gerar novo hash)

## Passos

1. Gerar novos segredos nos provedores (Supabase, DePix, Resend).
2. Atualizar variaveis na Vercel (Production/Preview).
3. Fazer redeploy apos salvar variaveis.
4. Invalidar sessao admin atual (troca de `ADMIN_SESSION_SECRET` faz logout global).
5. Testar checkout completo com pedido de teste.
6. Confirmar logs de webhook e envio de e-mail.

## Boas praticas

- Nunca commitar `.env.local`.
- Manter somente `.env.example` versionado.
- Evitar compartilhar screenshots de dashboards com tokens visiveis.

## Titularidade CPF x Nome (sem KYC externo por enquanto)

Atualmente o sistema aplica validacoes internas de coerencia de dados no checkout.
Nao ha consulta externa de titularidade nesta fase.

Ponto de extensao previsto:

- Integrar um fornecedor KYC no backend antes do fulfillment final.
- Em caso de divergencia de titularidade, manter pedido em `under_review` e nao enviar codigo.
