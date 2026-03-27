export interface PaidNotificationExtract {
  orderId: string;
  chargeId: string;
  paymentMethod: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Extrai pedido pago (charge PAID) com reference_id = UUID do nosso `orders.id`. */
export function extractPaidCharge(
  payload: unknown
): PaidNotificationExtract | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const ref = root.reference_id;
  if (typeof ref !== "string" || !UUID_RE.test(ref)) return null;

  const charges = root.charges;
  if (!Array.isArray(charges)) return null;

  for (const c of charges) {
    if (!c || typeof c !== "object") continue;
    const ch = c as Record<string, unknown>;
    if (ch.status !== "PAID" || typeof ch.id !== "string") continue;

    let paymentMethod = "unknown";
    const pm = ch.payment_method;
    if (pm && typeof pm === "object" && pm !== null && "type" in pm) {
      paymentMethod = String((pm as { type?: string }).type ?? "unknown");
    }

    return {
      orderId: ref,
      chargeId: ch.id,
      paymentMethod,
    };
  }

  return null;
}
