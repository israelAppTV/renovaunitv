export interface PaidNotificationExtract {
  orderId: string;
  chargeId: string;
  paymentMethod: string;
}

/** UUID v4 comum (Postgres gen_random_uuid); evita rejeitar variantes válidas. */
const UUID_LOOSE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isOrderReferenceUuid(s: string): boolean {
  return UUID_LOOSE.test(s.trim());
}

function isPaidStatus(s: unknown): boolean {
  return typeof s === "string" && s.trim().toUpperCase() === "PAID";
}

function unwrapOnce(
  root: Record<string, unknown>
): Record<string, unknown> {
  const data = root.data;
  if (
    data &&
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data)
  ) {
    return data as Record<string, unknown>;
  }
  return root;
}

function paymentMethodFromCharge(ch: Record<string, unknown>): string {
  const pm = ch.payment_method;
  if (pm && typeof pm === "object" && pm !== null && "type" in pm) {
    return String((pm as { type?: string }).type ?? "unknown");
  }
  return "unknown";
}

function tryFromChargesAndRef(
  ref: string,
  charges: unknown[]
): PaidNotificationExtract | null {
  if (!isOrderReferenceUuid(ref)) return null;
  for (const c of charges) {
    if (!c || typeof c !== "object") continue;
    const ch = c as Record<string, unknown>;
    if (!isPaidStatus(ch.status) || typeof ch.id !== "string") continue;
    return {
      orderId: ref.trim(),
      chargeId: ch.id,
      paymentMethod: paymentMethodFromCharge(ch),
    };
  }
  return null;
}

/** Tenta `reference_id` + `charges` no objeto (formato Order / Checkout espelhado na doc). */
function tryOrderLike(root: Record<string, unknown>): PaidNotificationExtract | null {
  const refRaw = root.reference_id;
  if (typeof refRaw !== "string") return null;
  const charges = root.charges;
  if (!Array.isArray(charges)) return null;
  return tryFromChargesAndRef(refRaw, charges);
}

/**
 * Cobrança isolada (ex.: alguns webhooks de pagamento): id CHAR_*, status PAID,
 * `reference_id` = UUID do nosso pedido (mesmo enviado no checkout).
 */
function tryChargeOnly(root: Record<string, unknown>): PaidNotificationExtract | null {
  const id = root.id;
  if (typeof id !== "string" || !id.startsWith("CHAR_")) return null;
  if (!isPaidStatus(root.status)) return null;
  const ref = root.reference_id;
  if (typeof ref !== "string" || !isOrderReferenceUuid(ref)) return null;
  return {
    orderId: ref.trim(),
    chargeId: id,
    paymentMethod: paymentMethodFromCharge(root),
  };
}

/**
 * Extrai pedido pago (charge PAID) com `reference_id` = UUID do nosso `orders.id`.
 * Aceita payloads com wrapper `data`, `order` aninhado ou cobrança no nível raiz.
 */
export function extractPaidCharge(
  payload: unknown
): PaidNotificationExtract | null {
  if (!payload || typeof payload !== "object") return null;
  const root = unwrapOnce(payload as Record<string, unknown>);

  const direct = tryOrderLike(root);
  if (direct) return direct;

  const chargeOnly = tryChargeOnly(root);
  if (chargeOnly) return chargeOnly;

  const order = root.order;
  if (order && typeof order === "object" && order !== null) {
    const o = order as Record<string, unknown>;
    const hitOrder = tryOrderLike(o);
    if (hitOrder) return hitOrder;
    const hitCharge = tryChargeOnly(o);
    if (hitCharge) return hitCharge;
  }

  const checkout = root.checkout;
  if (checkout && typeof checkout === "object" && checkout !== null) {
    const c = checkout as Record<string, unknown>;
    const hit = tryOrderLike(c);
    if (hit) return hit;
    const hitCh = tryChargeOnly(c);
    if (hitCh) return hitCh;
  }

  return null;
}

/** Resumo seguro para logs (sem corpo completo / sem PII). */
export function pagbankPayloadSummary(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return { shape: typeof payload };
  }
  const root = unwrapOnce(payload as Record<string, unknown>);
  const keys = Object.keys(root).slice(0, 24);
  const ref = root.reference_id;
  const id = root.id;
  const charges = root.charges;
  const order = root.order;
  const checkout = root.checkout;
  return {
    topKeys: keys,
    hasCharges: Array.isArray(charges),
    chargesLen: Array.isArray(charges) ? charges.length : 0,
    referenceIdLooksLikeUuid:
      typeof ref === "string" && isOrderReferenceUuid(ref),
    idPrefix:
      typeof id === "string"
        ? id.slice(0, Math.min(5, id.length))
        : undefined,
    nestedOrder: order && typeof order === "object",
    nestedCheckout: checkout && typeof checkout === "object",
  };
}
