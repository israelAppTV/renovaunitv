# Evidência de Teste Real em Sandbox — Integração PagBank (PIX Checkout)

**Aplicação:** `https://renovaunitv.vercel.app`  
**Ambiente PagBank:** Sandbox (`https://sandbox.api.pagseguro.com`)  
**Meio de pagamento testado:** PIX  
**Data do teste:** 2026-04-09

---

## 1) Request enviado para API PagBank (`POST /checkouts`)

```text
2026-04-09 10:46:55.075 [info] [homolog][pagbank] request /checkouts full_json {"method":"POST","url":"https://sandbox.api.pagseguro.com/checkouts","authorization":"Bearer d36e3f...","body":{"reference_id":"860fc154-bf47-4576-9ad7-87a98ecf7a65","customer_modifiable":false,"customer":{"name":"israel teste","email":"ma***@gmail.com","tax_id":"***","phone":{"country":"+55","area":"19","number":"***"}},"items":[{"reference_id":"mensal","name":"Recarga UniTV Mensal","quantity":1,"unit_amount":2490}],"payment_methods":[{"type":"PIX"}],"redirect_url":"https://renovaunitv.vercel.app/checkout/sucesso?ref=860fc154-bf47-4576-9ad7-87a98ecf7a65","return_url":"https://renovaunitv.vercel.app/checkout/cancelado","notification_urls":["https://renovaunitv.vercel.app/api/webhooks/pagbank"],"payment_notification_urls":["https://renovaunitv.vercel.app/api/webhooks/pagbank"]}}
```

---

## 2) Response recebido da API PagBank (`POST /checkouts`)

```text
2026-04-09 10:46:55.430 [info] [homolog][pagbank] response /checkouts full_json {"status":201,"ok":true,"body":{"id":"CHEC_2ADAEFB1-EAFC-4528-A494-4EC095933132","reference_id":"860fc154-bf47-4576-9ad7-87a98ecf7a65","created_at":"2026-04-09T07:46:55-03:00","status":"ACTIVE","customer":{"name":"israel teste","email":"magno1544c@gmail.com","tax_id":"16605259858","phone":{"country":"+55","area":"19","number":"997050228"}},"customer_modifiable":false,"items":[{"reference_id":"mensal","name":"Recarga UniTV Mensal","quantity":1,"unit_amount":2490}],"additional_amount":0,"discount_amount":0,"payment_methods":[{"type":"PIX"}],"redirect_url":"https://renovaunitv.vercel.app/checkout/sucesso?ref=860fc154-bf47-4576-9ad7-87a98ecf7a65","return_url":"https://renovaunitv.vercel.app/checkout/cancelado","notification_urls":["https://renovaunitv.vercel.app/api/webhooks/pagbank"],"payment_notification_urls":["https://renovaunitv.vercel.app/api/webhooks/pagbank"],"links":[{"rel":"SELF","href":"https://sandbox.api.pagseguro.com/checkouts/CHEC_2ADAEFB1-EAFC-4528-A494-4EC095933132","method":"GET"},{"rel":"PAY","href":"https://pagamento.sandbox.pagbank.com.br/pagamento?code=2adaefb1-eafc-4528-a494-4ec095933132","method":"GET"},{"rel":"INACTIVATE","href":"https://sandbox.api.pagseguro.com/checkouts/CHEC_2ADAEFB1-EAFC-4528-A494-4EC095933132/inactivate","method":"POST"}],"origin":"CHECKOUT_WEB"}}
```

---

## 3) Request de webhook recebido do PagBank (`POST /api/webhooks/pagbank`)

```text
2026-04-09 10:47:30.095 [warning] [webhook] SANDBOX: x-authenticity-token ausente — processando mesmo assim (limitação conhecida do PagBank em sandbox; em produção o header é obrigatório)
2026-04-09 10:47:30.095 [info] [homolog][pagbank] request /api/webhooks/pagbank {
  contentType: 'application/json',
  hasAuthenticityToken: false,
  xProductOrigin: 'CHECKOUT',
  xProductId: 'CHEC_2ADAEFB1-EAFC-4528-A494-4EC095933132',
  signatureOk: false,
  sandbox: true,
  rawBody: '{"id":"ORDE_51741597-2D54-4B1C-BDC3-90E88B9A31CF","reference_id":"860fc154-bf47-4576-9ad7-87a98ecf7a65","created_at":"2026-04-09T07:47:08.107-03:00","customer":{"name":"israel teste","email":"magno1544c@gmail.com","tax_id":"16605259858","phones":[{"type":"MOBILE","country":"+55","area":"19","number":"997050228"}]},"items":[{"reference_id":"mensal","name":"Recarga UniTV Mensal","quantity":1,"unit_amount":2490}],"qr_codes":[{"id":"QRCO_1A0CF310-C213-40C3-A78B-44A5A91D5324","expiration_date":"2026-04-10T23:59:59.000-03:00","amount":{"value":2490},"text":"00020101021226850014br.gov.bcb.pix2563api-h.pagseguro.com/pix/v2/1A0CF310-C213-40C3-A78B-44A5A91D532427600016BR.COM.PAGSEGURO01361A0CF310-C213-40C3-A78B-44A5A91D5324520453115303986540524.905802BR5921ISRAEL ALVES DA SILVA6008Trindade62070503***6304B77A","arrangements":["PIX"],"links":[{"rel":"QRCODE.PNG","href":"https://sandbox.api.pagseguro.com/qrcode/QRCO_1A0CF310-C213-40C3-A78B-44A5A91D5324/png","media":"image/png","type":"GET"},{"rel":"QRCODE.BASE64","href":"https://sandbox.api.pagseguro.com/qrcode/QRCO_1A0CF310-C213-40C3-A78B-44A5A91D5324/base64","media":"text/plain","type":"GET"}]}],"charges":[{"id":"CHAR_1A0CF310-C213-40C3-A78B-44A5A91D5324","reference_id":"860fc154-bf47-4576-9ad7-87a98ecf7a65","status":"PAID","created_at":"2026-04-09T07:47:25.582-03:00","paid_at":"2026-04-09T07:47:28.378-03:00","amount":{"value":2490,"currency":"BRL","summary":{"total":2490,"paid":2490,"refunded":0,"incremented":0}},"payment_response":{"code":"20000","message":"SUCESSO"},"payment_method":{"type":"PIX","pix":{"notification_id":"NTF_425FBCEF-2778-4B85-80D8-438774ED7DFA","end_to_end_id":"f93d01c1717946c6b4cea86f6a0d769d","holder":{"name":"API-PIX Payer Mock","tax_id":"***931180**"}}},"links":[{"rel":"SELF","href":"https://internal.sandbox.api.pagseguro.com/charges/CHAR_1A0CF310-C213-40C3-A78B-44A5A91D5324","media":"application/json","type":"GET"},{"rel":"CHARGE.CANCEL","href":"https://internal.sandbox.api.pagseguro.com/charges/CHAR_1A0CF310-C213-40C3-A78B-44A5A91D5324/cancel","media":"application/json","type":"POST"}],"metadata":{"ps_order_id":"ORDE_51741597-2D54-4B1C-BDC3-90E88B9A31CF"}}],"notification_urls":["https://renovaunitv.vercel.app/api/webhooks/pagbank"],"links":[{"rel":"SELF","href":"https://sandbox.api.pagseguro.com/orders/ORDE_51741597-2D54-4B1C-BDC3-90E88B9A31CF","media":"application/json","type":"GET"},{"rel":"PAY","href":"https://sandbox.api.pagseguro.com/orders/ORDE_51741597-2D54-4B1C-BDC3-90E88B9A31CF/pay","media":"application/json","type":"POST"}]}'
}
```

---

## 4) Response do endpoint do lojista ao webhook

```text
2026-04-09 10:47:31.615 [info] [homolog][pagbank] response /api/webhooks/pagbank {
  status: 200,
  ok: true,
  paid: {
    orderId: '860fc154-bf47-4576-9ad7-87a98ecf7a65',
    chargeId: 'CHAR_1A0CF310-C213-40C3-A78B-44A5A91D5324',
    paymentMethod: 'PIX'
  },
  fulfill: { duplicate: false, codeSent: true }
}
```

---

## 5) Evidência de envio de e-mail após confirmação de pagamento

```text
2026-04-09 10:47:31.615 [info] [email] código enviado (pedido) 860fc154-bf47-4576-9ad7-87a98ecf7a65
```

---

## Referências da API

- [Criar Checkout](https://developer.pagbank.com.br/reference/criar-checkout)
- [Webhooks](https://developer.pagbank.com.br/reference/webhooks)
- [Confirmar autenticidade da notificação](https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao)
