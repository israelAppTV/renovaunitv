import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaidNotificationExtract } from "@/lib/pagbank/parse-paid-notification";
import { sendOrderCodeEmail } from "@/services/email/send-order-code-email";

interface FulfillRpcRow {
  ok?: boolean;
  duplicate?: boolean;
  code?: string;
  reason?: string;
}

export async function fulfillPaidNotification(
  paid: PaidNotificationExtract
): Promise<{ duplicate: boolean; codeSent: boolean }> {
  const supabase = createServiceRoleClient();
  const idempotencyKey = `${paid.chargeId}:PAID`;

  const { data, error } = await supabase.rpc("fulfill_order_pagbank_payment", {
    p_order_id: paid.orderId,
    p_idempotency_key: idempotencyKey,
    p_charge_id: paid.chargeId,
    p_payment_method: paid.paymentMethod,
  });

  if (error) {
    if (error.message?.includes("out_of_stock")) {
      console.error("[webhook] Sem código disponível para o pedido", paid.orderId);
      throw new Error("out_of_stock");
    }
    throw new Error(error.message ?? "RPC fulfill falhou");
  }

  const row = data as FulfillRpcRow | null;
  const duplicate = Boolean(row?.duplicate);

  if (duplicate || !row?.ok) {
    return { duplicate: true, codeSent: false };
  }

  const code = typeof row.code === "string" ? row.code : null;
  if (!code) {
    return { duplicate: false, codeSent: false };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("customer_email")
    .eq("id", paid.orderId)
    .maybeSingle();

  const email =
    order && typeof order.customer_email === "string"
      ? order.customer_email
      : null;

  const { data: item } = await supabase
    .from("order_items")
    .select("product_id")
    .eq("order_id", paid.orderId)
    .limit(1)
    .maybeSingle();

  let productName = "Recarga";
  const pid = item?.product_id as string | undefined;
  if (pid) {
    const { data: prod } = await supabase
      .from("products")
      .select("name")
      .eq("id", pid)
      .maybeSingle();
    if (prod?.name) productName = prod.name as string;
  }

  let codeSent = false;
  if (!email) {
    console.warn(
      "[webhook] Pedido sem customer_email — código atribuído mas e-mail não enviado",
      paid.orderId
    );
  } else {
    const r = await sendOrderCodeEmail({
      to: email,
      productName,
      code,
      orderId: paid.orderId,
    });
    codeSent = r.sent;
    if (!r.sent && r.reason && r.reason !== "email_not_configured") {
      console.error("[webhook] Falha ao enviar e-mail", paid.orderId, r.reason);
    }
  }

  return { duplicate: false, codeSent };
}
