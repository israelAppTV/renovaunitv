# Ngrok + checkout PagBank (desenvolvimento local)

O **Next.js** roda no seu PC em `http://localhost:3000`. O **PagBank** não aceita essa URL nos campos de redirect e webhook. O **ngrok** cria um endereço **HTTPS na internet** que encaminha tudo para a sua porta 3000 — assim o PagBank “enxerga” um site público.

## O que cada coisa faz

| Peça | Função |
|------|--------|
| `npm run dev` | Sobe o site localmente na porta **3000**. |
| `ngrok http 3000` | Abre um túnel: URL pública `https://xxxx.ngrok-free.app` → seu `localhost:3000`. |
| `NEXT_PUBLIC_SITE_URL` | Informa ao app qual é essa URL pública (redirects e `/api/webhooks/pagbank`). |

---

## Passo 1 — Instalar o ngrok (uma vez)

1. Acesse [https://ngrok.com/download](https://ngrok.com/download).
2. Crie uma conta gratuita no ngrok (se ainda não tiver).
3. No dashboard, copie seu **authtoken** e rode no terminal (substitua o token):

   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

4. Confirme que o comando `ngrok version` funciona no terminal.

*(No Windows, adicione a pasta do ngrok ao PATH ou use o caminho completo do executável.)*

---

## Passo 2 — Subir o site (terminal 1)

Na pasta do projeto:

```bash
npm run dev
```

Deixe rodando. O site fica em `http://localhost:3000`.

---

## Passo 3 — Subir o túnel (terminal 2)

Abra **outro** terminal e rode:

```bash
npm run tunnel
```

Ou diretamente:

```bash
ngrok http 3000
```

O ngrok mostra uma linha **Forwarding**, por exemplo:

`https://a1b2-3c4d-5e6f.ngrok-free.app -> http://localhost:3000`

Copie a URL que começa com **`https://`** (sem barra no final).

---

## Passo 4 — Configurar o `.env.local`

Abra `.env.local` e defina (troque pela URL do passo 3):

```env
NEXT_PUBLIC_SITE_URL=https://a1b2-3c4d-5e6f.ngrok-free.app
```

Salve o arquivo e **reinicie** o `npm run dev` (Ctrl+C no terminal 1 e `npm run dev` de novo) para o Next carregar a variável.

---

## Passo 5 — Testar o fluxo

1. **Não** use só `http://localhost:3000` como “site oficial” do teste com PagBank.
2. No navegador, abra: **`https://SUA-URL-NGROK.ngrok-free.app`** (a mesma do `NEXT_PUBLIC_SITE_URL`).
3. Se o ngrok mostrar uma página de aviso “Visit Site”, clique para continuar (plano gratuito).
4. Vá em **Comprar recarga** → checkout → **Ir para o PagBank**.

Assim, `redirect_url`, `return_url` e as URLs de notificação batem com o que o PagBank espera.

---

## Passo 6 — Quando o ngrok reinicia

No plano gratuito, a URL do túnel **pode mudar** cada vez que você fecha e abre o ngrok.

Sempre que mudar:

1. Atualize `NEXT_PUBLIC_SITE_URL` no `.env.local`.
2. Reinicie `npm run dev`.

---

## Sandbox PagBank

Continue usando no `.env.local`:

```env
PAGBANK_API_BASE_URL=https://sandbox.api.pagseguro.com
PAGBANK_TOKEN=seu_token_sandbox
```

---

## Problemas comuns

| Sintoma | O que fazer |
|---------|-------------|
| PagBank 400 em URLs | Confirme `NEXT_PUBLIC_SITE_URL` **https**, sem `/` no final, igual à URL do ngrok. |
| Webhook não chega | Use a URL **ngrok** no navegador; confira se o túnel ainda está ativo no terminal 2. |
| `ngrok` não encontrado | Instale o CLI e configure o PATH, ou use o caminho completo do executável. |

---

## Produção

Em produção (ex.: Vercel) use o domínio real com HTTPS; não precisa de ngrok. Defina `NEXT_PUBLIC_SITE_URL` com esse domínio ou deixe a Vercel definir via `VERCEL_URL`.
