# Production safety check – Módulo Catálogo de Produtos

**Data:** aplicado após implementação do módulo de catálogo (`/products`).  
**Referência:** [prompts/production-audit.md](production-audit.md) e [prompts/security-audit.md](security-audit.md).

---

## 1. Data exposure

| Item | Status | Notas |
|------|--------|--------|
| Dados sensíveis no cliente | OK | Apenas campos de catálogo: id, name, description, price, image_url, stock_count, etc. Nenhum código digital, token ou PII. |
| Over-fetching | OK | `products.service.ts` usa `select()` explícito; não usa `*`. |

---

## 2. Authentication & authorization

| Item | Status | Notas |
|------|--------|--------|
| RLS | OK | Acesso ao Supabase via `createClient()` do server; RLS aplicado. |
| Políticas atuais | Atenção | `products` e `categories` têm SELECT apenas para `authenticated`. Se o catálogo for **público**, é necessário criar políticas para `anon` (ex.: SELECT em products onde `is_active = true`). Se o catálogo for só para logados, está correto. |
| Admin | OK | Nenhum dado de admin ou de códigos exposto no módulo. |

---

## 3. Input validation

| Item | Status | Notas |
|------|--------|--------|
| searchParams | OK | `page` e `category` tratados: page limitado com `Math.max(1, parseInt(..., 10) || 1)`; categoryId usado só se existir. |
| Paginação | OK | `limit` limitado entre 1 e 50 no service (`Math.min(50, Math.max(1, limit))`). |
| categoryId | OK | Enviado como UUID para o Supabase; RLS e FK restringem valores válidos. |

---

## 4. Errors

| Item | Status | Notas |
|------|--------|--------|
| Mensagens ao usuário | OK | Service lança "Falha ao carregar produtos" / "Falha ao carregar categorias" genéricas; sem stack ou detalhes internos. |
| Logs | N/A | Não há logging explícito no módulo; recomendável logar erros no servidor (ex.: em API route ou Server Action) sem expor ao cliente. |

---

## 5. Performance

| Item | Status | Notas |
|------|--------|--------|
| N+1 | OK | Uma query para produtos (com count) e uma para categorias; `Promise.all` para paralelizar. |
| Paginação | OK | Uso de `.range(from, to)` no Supabase; índice em `products(category_id)` e `is_active` existem. |

---

## 6. Stock / codes

| Item | Status | Notas |
|------|--------|--------|
| Códigos digitais | OK | Nenhuma leitura ou exposição de `digital_codes` no catálogo. |
| Reserva/estoque | OK | Apenas exibição de `stock_count` e botão "Indisponível" quando 0; lógica de reserva fica em services/API fora deste módulo. |

---

## Resumo

- **Aprovado para produção** do ponto de vista de exposição de dados, validação de entrada, erros e performance.
- **Decisão de produto:** confirmar se o catálogo deve ser acessível sem login; em caso positivo, adicionar políticas RLS para `anon` em `products` e `categories` (apenas SELECT, com `is_active = true` para products).
