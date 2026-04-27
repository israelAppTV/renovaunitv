import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env.server";
import { getDepixEnv } from "@/lib/depix/env";
import { getDepixCheckoutById } from "@/lib/depix/create-checkout";
import { verifyDepixWebhookSignature } from "@/lib/depix/verify-webhook";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
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

interface OrderSnapshot {
  id: string;
  total_amount: number;
  customer_name: string | null;
  customer_tax_id: string | null;
  customer_email: string | null;
  customer_phone_area: string | null;
  customer_phone_number: string | null;
  ip_address: string | null;
}

type RiskDecision = "auto_fulfill" | "under_review";

function parsePaidEvent(payload: unknown): { orderId?: string; paymentId: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as DepixWebhookPayload;
  if (p.event !== "checkout.completed") return null;
  const paymentId = p.data?.id;
  if (!paymentId) return null;
  const orderId = p.data?.metadata?.order_id;
  return { orderId, paymentId };
}

async function resolveOrderId(
  paid: ReturnType<typeof parsePaidEvent>
): Promise<string | null> {
  if (!paid) return null;
  if (paid.orderId) return paid.orderId;

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("depix_checkout_id", paid.paymentId)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

async function loadOrderSnapshot(orderId: string): Promise<OrderSnapshot | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, total_amount, customer_name, customer_tax_id, customer_email, customer_phone_area, customer_phone_number, ip_address"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    total_amount: data.total_amount as number,
    customer_name: (data.customer_name as string | null) ?? null,
    customer_tax_id: (data.customer_tax_id as string | null) ?? null,
    customer_email: (data.customer_email as string | null) ?? null,
    customer_phone_area: (data.customer_phone_area as string | null) ?? null,
    customer_phone_number: (data.customer_phone_number as string | null) ?? null,
    ip_address: (data.ip_address as string | null) ?? null,
  };
}

async function assessOrderRisk(order: OrderSnapshot): Promise<{
  decision: RiskDecision;
  score: number;
  reasons: string[];
}> {
  const supabase = createServiceRoleClient();
  let score = 0;
  const reasons: string[] = [];

  if (order.total_amount >= 50000) {
    score += 2;
    reasons.push("high_amount");
  }

  if (order.customer_email) {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", order.customer_email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      score += 2;
      reasons.push("email_velocity_15m");
    }
  }

  if (order.customer_tax_id) {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_tax_id", order.customer_tax_id)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      score += 2;
      reasons.push("taxid_velocity_15m");
    }
  }

  if (order.customer_phone_area && order.customer_phone_number) {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_phone_area", order.customer_phone_area)
      .eq("customer_phone_number", order.customer_phone_number)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      score += 2;
      reasons.push("phone_velocity_15m");
    }
  }

  if (order.ip_address) {
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", order.ip_address)
      .gte("created_at", since);
    if ((count ?? 0) >= 4) {
      score += 2;
      reasons.push("ip_velocity_15m");
    }
  }

  return {
    decision: score >= 3 ? "under_review" : "auto_fulfill",
    score,
    reasons,
  };
}

async function persistRiskDecision(params: {
  orderId: string;
  paymentId: string;
  decision: RiskDecision;
  score: number;
  reasons: string[];
  webhookPayload: unknown;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("order_risk_reviews").insert({
      order_id: params.orderId,
      payment_id: params.paymentId,
      decision: params.decision,
      risk_score: params.score,
      reasons: params.reasons,
      metadata: { payload: params.webhookPayload },
    });
  } catch (e) {
    console.error("[webhook][depix] falha ao persistir decisão de risco", e);
  }
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
  const signatureOk = verifyDepixWebhookSignature(rawBody, sig, webhookSecret, 300);
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
  const orderId = await resolveOrderId(paid);
  if (!orderId) {
    console.warn(
      "[webhook][depix] checkout.completed sem order_id no metadata e sem match por depix_checkout_id",
      paid.paymentId
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  let resolvedOrderId: string = orderId;
  try {
    const order = await loadOrderSnapshot(orderId);
    if (!order) {
      console.warn("[webhook][depix] pedido não encontrado para checkout", paid.paymentId);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const checkout = await getDepixCheckoutById(paid.paymentId);
    const metadataOrderId =
      typeof checkout.metadata?.order_id === "string"
        ? checkout.metadata.order_id
        : null;
    if (checkout.status !== "completed") {
      return NextResponse.json({ ok: true, ignored: true });
    }
    if (checkout.amount !== order.total_amount) {
      console.error("[webhook][depix] valor divergente entre pedido e checkout", {
        orderId: order.id,
        checkoutId: checkout.id,
        orderAmount: order.total_amount,
        checkoutAmount: checkout.amount,
      });
      return NextResponse.json({ ok: false, error: "amount_mismatch" }, { status: 409 });
    }
    if (metadataOrderId && metadataOrderId !== order.id) {
      console.error("[webhook][depix] metadata.order_id divergente", {
        orderId: order.id,
        metadataOrderId,
      });
      return NextResponse.json(
        { ok: false, error: "order_binding_mismatch" },
        { status: 409 }
      );
    }

    const risk = await assessOrderRisk(order);
    await persistRiskDecision({
      orderId: order.id,
      paymentId: paid.paymentId,
      decision: risk.decision,
      score: risk.score,
      reasons: risk.reasons,
      webhookPayload: payload,
    });
    if (risk.decision === "under_review") {
      const supabase = createServiceRoleClient();
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
      console.warn("[webhook][depix] pedido em revisão manual", {
        orderId: order.id,
        score: risk.score,
        reasons: risk.reasons,
      });
      return NextResponse.json({ ok: true, held_for_review: true });
    }

    const result = await fulfillPaidNotification({
      orderId: order.id,
      paymentId: paid.paymentId,
      paymentMethod: "pix",
    });
    if (!result.codeSent && !result.duplicate) {
      console.warn(
        "[webhook][depix] fulfill ok mas e-mail não enviado (ver Resend / customer_email)",
        order.id
      );
    }
    if (shouldHomologLog()) {
      console.info(
        "[homolog][depix] response /api/webhooks/depix",
        safeStringify({
          status: 200,
          ok: true,
          paid: { ...paid, orderId: order.id },
          fulfill: result,
          risk,
        })
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "out_of_stock") {
      console.error("[webhook][depix] out_of_stock", resolvedOrderId);
      return NextResponse.json(
        { ok: false, error: "out_of_stock" },
        { status: 500 }
      );
    }
    console.error("[webhook][depix]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
