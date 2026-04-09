import "server-only";
import { getPagBankEnv } from "@/lib/pagbank/env";

export interface PagBankCheckoutLink {
  rel: string;
  href: string;
  method?: string;
}

export interface CreateCheckoutInput {
  referenceId: string;
  customer: {
    name: string;
    email: string;
    tax_id: string;
    /** Obrigatório com `customer_modifiable: false` (regra PagBank). */
    phone: { country: string; area: string; number: string };
  };
  items: Array<{
    reference_id: string;
    name: string;
    quantity: number;
    unit_amount: number;
  }>;
  redirectUrl: string;
  returnUrl: string;
  notificationUrls: string[];
  paymentNotificationUrls: string[];
}

export interface CreateCheckoutResult {
  checkoutId: string;
  payUrl: string;
  raw: unknown;
}

/** Extrai mensagens legíveis do corpo de erro da API Checkout. */
export function formatPagBankCheckoutErrorBody(json: Record<string, unknown>): string {
  const msgs = json.error_messages;
  if (Array.isArray(msgs) && msgs.length > 0) {
    const parts: string[] = [];
    for (const m of msgs) {
      if (!m || typeof m !== "object") continue;
      const o = m as Record<string, unknown>;
      const code = typeof o.error === "string" ? o.error : "";
      const param =
        typeof o.parameter_name === "string" ? o.parameter_name : "";
      const desc = typeof o.description === "string" ? o.description : "";
      const line = [code, param && `(${param})`, desc && `- ${desc}`]
        .filter(Boolean)
        .join(" ");
      if (line.trim()) parts.push(line.trim());
    }
    if (parts.length) return parts.join(" | ");
  }
  if (typeof json.message === "string" && json.message) return json.message;
  return "Bad Request";
}

function findPayUrl(links: unknown): string | null {
  if (!Array.isArray(links)) return null;
  for (const item of links) {
    const o = item as PagBankCheckoutLink;
    if (o && o.rel === "PAY" && typeof o.href === "string") {
      return o.href;
    }
  }
  return null;
}

function shouldHomologLog(): boolean {
  return process.env.PAGBANK_HOMOLOG_LOGS === "true";
}

function redactEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "***";
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '"<unserializable>"';
  }
}

export async function createPagBankCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  const { PAGBANK_TOKEN, PAGBANK_API_BASE_URL } = getPagBankEnv();
  const url = `${PAGBANK_API_BASE_URL.replace(/\/$/, "")}/checkouts`;

  const body = {
    reference_id: input.referenceId,
    customer_modifiable: false,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      tax_id: input.customer.tax_id.replace(/\D/g, ""),
      phone: {
        country: input.customer.phone.country.startsWith("+")
          ? input.customer.phone.country
          : `+${input.customer.phone.country.replace(/^\+/, "")}`,
        area: input.customer.phone.area.replace(/\D/g, "").slice(0, 2),
        number: input.customer.phone.number.replace(/\D/g, "").slice(0, 9),
      },
    },
    items: input.items.map((i) => ({
      reference_id: i.reference_id,
      name: i.name,
      quantity: i.quantity,
      unit_amount: i.unit_amount,
    })),
    payment_methods: [{ type: "PIX" }],
    redirect_url: input.redirectUrl,
    return_url: input.returnUrl,
    notification_urls: input.notificationUrls,
    payment_notification_urls: input.paymentNotificationUrls,
  };

  if (shouldHomologLog()) {
    const sanitizedRequest = {
      method: "POST",
      url,
      authorization: `Bearer ${PAGBANK_TOKEN.slice(0, 6)}...`,
      body: {
        ...body,
        customer: {
          ...body.customer,
          email: redactEmail(body.customer.email),
          tax_id: "***",
          phone: {
            ...body.customer.phone,
            number: "***",
          },
        },
      },
    };
    console.info(
      "[homolog][pagbank] request /checkouts full_json",
      safeStringify(sanitizedRequest)
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (shouldHomologLog()) {
    const fullResponse = {
      status: res.status,
      ok: res.ok,
      body: json,
    };
    console.info(
      "[homolog][pagbank] response /checkouts full_json",
      safeStringify(fullResponse)
    );
  }

  if (!res.ok) {
    const detail =
      typeof json === "object" && json
        ? formatPagBankCheckoutErrorBody(json as Record<string, unknown>)
        : res.statusText;
    throw new Error(`PagBank checkout ${res.status}: ${detail}`);
  }

  const checkoutId = typeof json.id === "string" ? json.id : "";
  const payUrl = findPayUrl(json.links);
  if (!checkoutId || !payUrl) {
    throw new Error("PagBank: resposta sem id ou link PAY");
  }

  return { checkoutId, payUrl, raw: json };
}
