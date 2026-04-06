# Integração PagBank — Requisições e respostas

**Site:** renovaunitv.com.br  
**Meio de pagamento:** PIX (Checkout)  
**Documentação de referência:** [Criar Checkout](https://developer.pagbank.com.br/reference/criar-checkout)

**Ambientes**

| Ambiente | Base URL |
|----------|----------|
| Sandbox | `https://sandbox.api.pagseguro.com` |
| Produção | `https://api.pagseguro.com` |

A integração utiliza o endpoint **Criar Checkout** (`POST /checkouts`) com `payment_methods` restrito a PIX. Não há uso do fluxo de pagamento com cartão de crédito nesta aplicação.

---

## 1. Criar Checkout

**Método e rota:** `POST {base_url}/checkouts`

**Cabeçalhos**

```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Corpo da requisição (JSON)**

```json
{
  "reference_id": "7a9e0cf7-17f4-40b5-a826-1056b2ea78f8",
  "customer_modifiable": false,
  "customer": {
    "name": "Maria Silva",
    "email": "cliente@exemplo.com",
    "tax_id": "12345678909",
    "phone": {
      "country": "+55",
      "area": "11",
      "number": "999999999"
    }
  },
  "items": [
    {
      "reference_id": "mensal",
      "name": "Recarga UniTV Mensal",
      "quantity": 1,
      "unit_amount": 2490
    }
  ],
  "payment_methods": [{ "type": "PIX" }],
  "redirect_url": "https://www.renovaunitv.com.br/checkout/sucesso?ref=7a9e0cf7-17f4-40b5-a826-1056b2ea78f8",
  "return_url": "https://www.renovaunitv.com.br/checkout/cancelado",
  "notification_urls": ["https://www.renovaunitv.com.br/api/webhooks/pagbank"],
  "payment_notification_urls": ["https://www.renovaunitv.com.br/api/webhooks/pagbank"]
}
```

**Campos**

| Campo | Descrição |
|-------|-----------|
| `reference_id` | Identificador do pedido no sistema do lojista (UUID). |
| `unit_amount` | Valor do item em centavos (ex.: 2490 = R$ 24,90). |
| `notification_urls` | URLs HTTPS para notificação de eventos do checkout. |
| `payment_notification_urls` | URLs HTTPS para notificação de eventos de pagamento. |

**Resposta HTTP (sucesso)**

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

**Corpo da resposta (JSON) — exemplo**

```json
{
  "id": "CHEC_XXXXXXXXXXXXXXXX",
  "reference_id": "7a9e0cf7-17f4-40b5-a826-1056b2ea78f8",
  "status": "ACTIVE",
  "created_at": "2026-04-01T12:28:00.000-03:00",
  "expiration_date": "2026-04-01T14:28:00.000-03:00",
  "customer": {
    "name": "Maria Silva",
    "email": "cliente@exemplo.com",
    "tax_id": "12345678909",
    "phones": [
      {
        "country": "+55",
        "area": "11",
        "number": "999999999",
        "type": "MOBILE"
      }
    ]
  },
  "items": [
    {
      "reference_id": "mensal",
      "name": "Recarga UniTV Mensal",
      "quantity": 1,
      "unit_amount": 2490
    }
  ],
  "payment_methods": [{ "type": "PIX" }],
  "links": [
    {
      "rel": "SELF",
      "href": "https://sandbox.api.pagseguro.com/checkouts/CHEC_XXXXXXXXXXXXXXXX",
      "media": "application/json",
      "type": "GET"
    },
    {
      "rel": "PAY",
      "href": "https://sandbox.api.pagseguro.com/checkouts/CHEC_XXXXXXXXXXXXXXXX/pay",
      "media": "application/json",
      "type": "GET"
    }
  ]
}
```

O fluxo de pagamento utiliza o link retornado na operação de checkout (fluxo hospedado). A integração lê o identificador `id` do checkout e o link com `rel: "PAY"` no array `links`.

**Resposta HTTP (erro)**

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "error_messages": [
    {
      "code": "40000",
      "description": "Mensagem descritiva do erro",
      "parameter_name": "campo"
    }
  ]
}
```

---

## 2. Webhook (notificação de pagamento)

**URL configurada no checkout**

```http
POST https://www.renovaunitv.com.br/api/webhooks/pagbank
```

Trata-se de uma chamada **recebida** pelo lojista, enviada pelo PagBank para as URLs informadas em `notification_urls` e `payment_notification_urls`.

**Cabeçalhos**

```http
Content-Type: application/json
x-authenticity-token: {assinatura_hexadecimal}
```

**Validação da autenticidade:** [Confirmar autenticidade da notificação](https://developer.pagbank.com.br/devpagbank/reference/confirmar-autenticidade-da-notificacao) — hash SHA-256 em hexadecimal da concatenação `{token}-{corpo_bruto}`.

**Corpo da requisição (JSON) — exemplo com cobrança paga**

```json
{
  "id": "ORDE_XXXXXXXXXXXXXXXX",
  "reference_id": "7a9e0cf7-17f4-40b5-a826-1056b2ea78f8",
  "charges": [
    {
      "id": "CHAR_XXXXXXXXXXXXXXXX",
      "status": "PAID",
      "payment_method": { "type": "PIX" }
    }
  ]
}
```

**Resposta HTTP do endpoint do lojista**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{ "ok": true }
```

**Referência:** [Webhooks](https://developer.pagbank.com.br/reference/webhooks)
