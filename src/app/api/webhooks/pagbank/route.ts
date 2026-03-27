import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { getPagBankEnv } from "@/lib/pagbank/env";
import { extractPaidCharge } from "@/lib/pagbank/parse-paid-notification";
import { verifyPagBankWebhookSignature } from "@/lib/pagbank/verify-webhook";
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
  try {
    token = getPagBankEnv().PAGBANK_TOKEN;
  } catch {
    return new Response("unconfigured", { status: 503 });
  }

  const sig = request.headers.get("x-authenticity-token");
  if (!verifyPagBankWebhookSignature(rawBody, token, sig)) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const paid = extractPaidCharge(payload);
  if (!paid) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await fulfillPaidNotification(paid);
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
