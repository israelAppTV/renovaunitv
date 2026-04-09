# Evidência de Teste Real em Sandbox — Integração PagBank (PIX Checkout)

**Aplicação:** `https://renovaunitv.vercel.app`  
**Ambiente PagBank:** Sandbox (`https://sandbox.api.pagseguro.com`)  
**Meio de pagamento testado:** PIX  
**Data do teste:** 2026-04-07

---

## 1) Request enviado para API PagBank (`POST /checkouts`)

```json
{
  "logTag": "[homolog][pagbank] request /checkouts",
  "method": "POST",
  "url": "https://sandbox.api.pagseguro.com/checkouts",
  "authorization": "Bearer d36e3f...",
  "body": {
    "reference_id": "0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "customer_modifiable": false,
    "customer": {
      "name": "teste mensal",
      "email": "ma***@gmail.com",
      "tax_id": "***",
      "phone": {
        "country": "+55",
        "area": "**",
        "number": "***"
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
    "redirect_url": "https://renovaunitv.vercel.app/checkout/sucesso?ref=0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "return_url": "https://renovaunitv.vercel.app/checkout/cancelado",
    "notification_urls": ["https://renovaunitv.vercel.app/api/webhooks/pagbank"],
    "payment_notification_urls": ["https://renovaunitv.vercel.app/api/webhooks/pagbank"]
  }
}
```

---

## 2) Response recebido da API PagBank (`POST /checkouts`)

```json
{
  "logTag": "[homolog][pagbank] response /checkouts",
  "status": 201,
  "ok": true,
  "body": {
    "id": "CHEC_87272428-65E5-4EDA-B6F5-C5290B3240D9",
    "reference_id": "0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "created_at": "2026-04-07T10:53:00-03:00",
    "status": "ACTIVE",
    "customer": {
      "name": "teste mensal",
      "email": "m***@gmail.com",
      "tax_id": "***"
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
    "redirect_url": "https://renovaunitv.vercel.app/checkout/sucesso?ref=0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "return_url": "https://renovaunitv.vercel.app/checkout/cancelado",
    "notification_urls": ["https://renovaunitv.vercel.app/api/webhooks/pagbank"],
    "payment_notification_urls": ["https://renovaunitv.vercel.app/api/webhooks/pagbank"],
    "links": [
      { "rel": "SELF" },
      { "rel": "PAY" },
      { "rel": "INACTIVATE" }
    ],
    "origin": "CHECKOUT_WEB"
  }
}
```

---

## 3) Request de webhook recebido do PagBank (`POST /api/webhooks/pagbank`)

```json
{
  "logTag": "[homolog][pagbank] request /api/webhooks/pagbank",
  "contentType": "application/json",
  "hasAuthenticityToken": false,
  "xProductOrigin": "CHECKOUT",
  "xProductId": "CHEC_87272428-65E5-4EDA-B6F5-C5290B3240D9",
  "signatureOk": false,
  "sandbox": true,
  "rawBody": {
    "id": "ORDE_87A4F550-6021-4F43-A0B9-668A191FE666",
    "reference_id": "0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "created_at": "2026-04-07T10:53:10.436-03:00",
    "customer": {
      "name": "teste mensal",
      "email": "m***@gmail.com",
      "tax_id": "***",
      "phones": [{ "type": "MOBILE", "country": "+55", "area": "**", "number": "***" }]
    },
    "items": [
      {
        "reference_id": "mensal",
        "name": "Recarga UniTV Mensal",
        "quantity": 1,
        "unit_amount": 2490
      }
    ],
    "charges": [
      {
        "id": "CHAR_57D1C74E-A298-445C-921D-C880E7BE2A37",
        "reference_id": "0f746e0a-13c1-4190-97ea-6596d0b94eca",
        "status": "PAID",
        "created_at": "2026-04-07T10:53:26.614-03:00",
        "paid_at": "2026-04-07T10:53:27.727-03:00",
        "amount": { "value": 2490, "currency": "BRL" },
        "payment_method": { "type": "PIX" }
      }
    ],
    "notification_urls": ["https://renovaunitv.vercel.app/api/webhooks/pagbank"]
  }
}
```

---

## 4) Response do endpoint do lojista ao webhook

```json
{
  "logTag": "[homolog][pagbank] response /api/webhooks/pagbank",
  "status": 200,
  "ok": true,
  "paid": {
    "orderId": "0f746e0a-13c1-4190-97ea-6596d0b94eca",
    "chargeId": "CHAR_57D1C74E-A298-445C-921D-C880E7BE2A37",
    "paymentMethod": "PIX"
  },
  "fulfill": {
    "duplicate": false,
    "codeSent": true
  }
}
```

---

## 5) Evidência de envio de e-mail após confirmação de pagamento

```text
[email] código enviado (pedido) 0f746e0a-13c1-4190-97ea-6596d0b94eca
```

---

## Referências da API

- [Criar Checkout](https://developer.pagbank.com.br/reference/criar-checkout)
- [Webhooks](https://developer.pagbank.com.br/reference/webhooks)
- [Confirmar autenticidade da notificação](https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao)
