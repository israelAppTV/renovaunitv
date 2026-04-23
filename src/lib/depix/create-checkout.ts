import "server-only";
import { getDepixEnv } from "@/lib/depix/env";

export interface CreateDepixCheckoutInput {
  amount: number;
  description?: string;
  callbackUrl: string;
  redirectUrl?: string;
  metadata: Record<string, unknown>;
}

export interface CreateDepixCheckoutResult {
  checkoutId: string;
  payUrl: string;
  raw: unknown;
}

function extractDepixErrorMessage(json: unknown): string {
  if (!json || typeof json !== "object") return "Falha ao criar checkout.";
  const obj = json as Record<string, unknown>;
  const response = obj.response;
  if (response && typeof response === "object") {
    const errorMessage = (response as Record<string, unknown>).errorMessage;
    if (typeof errorMessage === "string" && errorMessage.trim()) {
      return errorMessage.trim();
    }
  }
  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message.trim();
  }
  return "Falha ao criar checkout.";
}

export async function createDepixCheckout(
  input: CreateDepixCheckoutInput
): Promise<CreateDepixCheckoutResult> {
  const { DEPIX_API_KEY, DEPIX_API_BASE_URL } = getDepixEnv();
  const res = await fetch(`${DEPIX_API_BASE_URL}/api/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEPIX_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      description: input.description,
      callback_url: input.callbackUrl,
      redirect_url: input.redirectUrl,
      metadata: input.metadata,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`DePix checkout ${res.status}: ${extractDepixErrorMessage(json)}`);
  }

  const checkoutId = typeof json.id === "string" ? json.id : "";
  const payUrl = typeof json.payment_url === "string" ? json.payment_url : "";
  if (!checkoutId || !payUrl) {
    throw new Error("DePix: resposta sem id ou payment_url.");
  }

  return { checkoutId, payUrl, raw: json };
}
