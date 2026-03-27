# Site UniTV (landing) + painel admin oculto

Next.js 14 (App Router), TypeScript, Tailwind e **Supabase somente no servidor** (`service_role`) para importação e listagem de códigos. **Não há login nem Supabase Auth para visitantes** — apenas a página inicial com âncoras (`#planos`, `#tutoriais`, `#faq`).

## Stack

- Next.js 14, TypeScript, Tailwind, Zod
- Supabase (Postgres + RPC); cliente **service role** só em rotas/API admin
- Sessão admin: cookie httpOnly + JWT assinado (`jose`); senha com **bcrypt**

## Estrutura (resumo)

```
src/
  app/
    page.tsx              # Única página pública
    [adminSecret]/        # Painel (URL secreta; compara env ADMIN_PANEL_SECRET)
    api/admin/session     # Login / logout admin (JSON)
    api/admin/codes/import
  lib/
    env.ts                # NEXT_PUBLIC_SUPABASE_URL
    env.server.ts         # Service role + segredos admin (server-only)
    supabase/service-role.ts
  modules/admin/          # CodesImportForm
  services/admin/         # Import, listagem, sessão
database/migrations/      # SQL para aplicar no Supabase
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha **todos** os campos. O build valida `NEXT_PUBLIC_SUPABASE_URL`; rotas admin exigem também `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PANEL_SECRET`, `ADMIN_PASSWORD_BCRYPT_HASH` e `ADMIN_SESSION_SECRET`.

**Painel:** abra no navegador `http://localhost:3000/<ADMIN_PANEL_SECRET>` (sem link no site).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Supabase

Aplicar migrações em `database/migrations/` no SQL Editor (ou CLI), incluindo RPC `import_digital_codes_batch` restrita a `service_role` e políticas sem leitura anônima desnecessária em `products`/`categories` (conforme última migration).

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing (única página pública) |
| `/<ADMIN_PANEL_SECRET>` | Login / dashboard interno |
| `/<ADMIN_PANEL_SECRET>/codes` | Importar Excel + listar códigos |
