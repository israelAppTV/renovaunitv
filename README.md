# Marketplace de Códigos Digitais

Starter de ecommerce em Next.js 14 (App Router) com TypeScript, TailwindCSS e Supabase, seguindo as regras do `.cursorrules` e a arquitetura em `prompts/architecture.md`.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **TailwindCSS**
- **Supabase** (auth + banco)
- **Zod** (validação de env e schemas)
- **React Hook Form** + **@hookform/resolvers**
- **Axios**

## Estrutura

```
src/
  app/              # Rotas e layouts (App Router)
  components/       # Componentes de UI reutilizáveis (layout: Header, Footer, Container)
  modules/          # Módulos de domínio
    auth/           # Autenticação (AuthGuard, useAuthState)
    cart/           # Carrinho (CartSummary)
    products/       # Produtos (ProductCard)
    orders/         # Pedidos (OrderStatusBadge)
    admin/          # Admin (AdminGuard, useAdminCheck)
  lib/              # Configurações e clientes
    supabase/       # Cliente browser, server e middleware
    env.ts          # Validação de variáveis de ambiente (Zod)
  hooks/            # Re-exports de hooks dos módulos
  services/         # Lógica de negócio (sem UI)
  types/            # Tipos e interfaces globais
  utils/            # Utilitários (cn, etc.)
```

## Regras de arquitetura

- **Lógica de negócio** em `/services`, nunca dentro de componentes.
- **Acesso a dados** centralizado em `lib/supabase` (server.ts / client.ts).
- **Componentes** apenas apresentação; módulos agrupam por domínio (auth, cart, products, orders, admin).

## Configuração

1. Copie o exemplo de env:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha no `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. As variáveis são validadas com Zod ao importar `@/lib/env` (build e runtime).

## Scripts

```bash
npm run dev    # Desenvolvimento
npm run build  # Build de produção (requer .env com Supabase)
npm run start  # Servir build
npm run lint   # ESLint
```

## Rotas

| Rota       | Descrição              |
|-----------|------------------------|
| `/`       | Início                 |
| `/products` | Listagem de produtos |
| `/orders` | Meus pedidos (auth)     |
| `/cart`   | Carrinho               |
| `/admin`  | Painel admin (role admin) |

O layout global inclui Header (com navegação responsiva e Carrinho), Container e Footer.
