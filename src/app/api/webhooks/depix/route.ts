import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { getDepixEnv } from "@/lib/depix/env";
import { verifyDepixWebhookSignature } from "@/lib/depix/verify-webhook";
import { fulfillPaidNotification } from "@/services/checkout/fulfill-webhook.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shouldHomologLog(): boolean {
  return process.env.DEPIX_HOMOLOG_LOGS === "true";
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '"<unserializable>"';
  }
}

interface DepixWebhookPayload {
  event?: string;
  data?: {
    id?: string;
    metadata?: {
      order_id?: string;
    };
  };
}

function parsePaidEvent(payload: unknown): { orderId: string; paymentId: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as DepixWebhookPayload;
  if (p.event !== "checkout.completed") return null;
  const orderId = p.data?.metadata?.order_id;
  const paymentId = p.data?.id;
  if (!orderId || !paymentId) return null;
  return { orderId, paymentId };
}

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

  let webhookSecret: string;
  try {
    webhookSecret = getDepixEnv().DEPIX_WEBHOOK_SECRET;
  } catch {
    return new Response("unconfigured", { status: 503 });
  }

  const sig =
    request.headers.get("x-depix-signature") ??
    request.headers.get("X-DePix-Signature");
  const signatureOk = verifyDepixWebhookSignature(rawBody, sig, webhookSecret);
  if (shouldHomologLog()) {
    console.info(
      "[homolog][depix] request /api/webhooks/depix",
      safeStringify({
        contentType: request.headers.get("content-type"),
        hasDepixSignature: Boolean(sig?.trim()),
        signatureOk,
        rawBody,
      })
    );
  }
  if (!signatureOk) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const paid = parsePaidEvent(payload);
  if (!paid) {
    if (shouldHomologLog()) {
      console.info(
        "[homolog][depix] ignored /api/webhooks/depix",
        safeStringify({ payload })
      );
    }
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const result = await fulfillPaidNotification({
      orderId: paid.orderId,
      paymentId: paid.paymentId,
      paymentMethod: "pix",
    });
    if (!result.codeSent && !result.duplicate) {
      console.warn(
        "[webhook][depix] fulfill ok mas e-mail não enviado (ver Resend / customer_email)",
        paid.orderId
      );
    }
    if (shouldHomologLog()) {
      console.info(
        "[homolog][depix] response /api/webhooks/depix",
        safeStringify({
          status: 200,
          ok: true,
          paid,
          fulfill: result,
        })
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "out_of_stock") {
      console.error("[webhook][depix] out_of_stock", paid.orderId);
      return NextResponse.json(
        { ok: false, error: "out_of_stock" },
        { status: 500 }
      );
    }
    console.error("[webhook][depix]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
