import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { getPagBankEnv } from "@/lib/pagbank/env";
import {
  extractPaidCharge,
  pagbankPayloadSummary,
} from "@/lib/pagbank/parse-paid-notification";
import {
  isPagBankSandboxApiBaseUrl,
  verifyPagBankWebhookSignature,
} from "@/lib/pagbank/verify-webhook";
import { fulfillPaidNotification } from "@/services/checkout/fulfill-webhook.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    getServerEnv();
  } catch {
    return new Response("unconfigured", { status: 503 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return new Response("bad body", { status: 400 });
  }

  let token: string;
  let apiBaseUrl: string;
  try {
    const env = getPagBankEnv();
    token = env.PAGBANK_TOKEN;
    apiBaseUrl = env.PAGBANK_API_BASE_URL;
  } catch {
    return new Response("unconfigured", { status: 503 });
  }

  const sig =
    request.headers.get("x-authenticity-token") ??
    request.headers.get("X-Authenticity-Token");
  const sigTrim = sig?.trim() ?? "";
  const signatureOk = verifyPagBankWebhookSignature(rawBody, token, sig);
  const sandbox = isPagBankSandboxApiBaseUrl(apiBaseUrl);

  if (!signatureOk) {
    if (sandbox && !sigTrim) {
      console.warn(
        "[webhook] SANDBOX: x-authenticity-token ausente — processando mesmo assim (limitação conhecida do PagBank em sandbox; em produção o header é obrigatório)"
      );
    } else if (!sigTrim) {
      console.warn(
        "[webhook] recusado: x-authenticity-token ausente (defina PAGBANK_API_BASE_URL de sandbox para testes ou use token de produção com header válido)"
      );
      return new Response("invalid signature", { status: 401 });
    } else {
      console.warn(
        "[webhook] recusado: assinatura não confere — use o mesmo PAGBANK_TOKEN do portal (Integrações) na Vercel, sem espaços extras"
      );
      return new Response("invalid signature", { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const paid = extractPaidCharge(payload);
  if (!paid) {
    console.warn(
      "[webhook] ignorado: payload sem cobrança PAID + reference_id do pedido",
      pagbankPayloadSummary(payload)
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const result = await fulfillPaidNotification(paid);
    if (!result.codeSent && !result.duplicate) {
      console.warn(
        "[webhook] fulfill ok mas e-mail não enviado (ver Resend / customer_email)",
        paid.orderId
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "out_of_stock") {
      console.error("[webhook] out_of_stock", paid.orderId);
      return NextResponse.json(
        { ok: false, error: "out_of_stock" },
        { status: 500 }
      );
    }
    console.error("[webhook]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
