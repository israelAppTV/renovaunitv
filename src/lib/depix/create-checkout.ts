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

export interface DepixCheckoutDetails {
  id: string;
  status: string;
  amount: number;
  metadata?: Record<string, unknown> | null;
}

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
  const requestBody = {
    amount: input.amount,
    description: input.description,
    callback_url: input.callbackUrl,
    redirect_url: input.redirectUrl,
    metadata: input.metadata,
  };

  if (shouldHomologLog()) {
    console.info(
      "[homolog][depix] request /api/checkouts full_json",
      safeStringify({
        method: "POST",
        url: `${DEPIX_API_BASE_URL}/api/checkouts`,
        authorization: `Bearer ${DEPIX_API_KEY.slice(0, 10)}...`,
        body: requestBody,
      })
    );
  }

  const res = await fetch(`${DEPIX_API_BASE_URL}/api/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEPIX_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (shouldHomologLog()) {
    console.info(
      "[homolog][depix] response /api/checkouts full_json",
      safeStringify({
        status: res.status,
        ok: res.ok,
        body: json,
      })
    );
  }
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

export async function getDepixCheckoutById(
  checkoutId: string
): Promise<DepixCheckoutDetails> {
  const { DEPIX_API_KEY, DEPIX_API_BASE_URL } = getDepixEnv();
  const res = await fetch(
    `${DEPIX_API_BASE_URL}/api/checkouts/${encodeURIComponent(checkoutId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DEPIX_API_KEY}`,
        Accept: "application/json",
      },
    }
  );

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`DePix consult checkout ${res.status}: ${extractDepixErrorMessage(json)}`);
  }

  const checkout = json.checkout as Record<string, unknown> | undefined;
  const id = typeof checkout?.id === "string" ? checkout.id : "";
  const status = typeof checkout?.status === "string" ? checkout.status : "";
  const amount = typeof checkout?.amount === "number" ? checkout.amount : NaN;
  const metadata =
    checkout?.metadata && typeof checkout.metadata === "object"
      ? (checkout.metadata as Record<string, unknown>)
      : null;

  if (!id || !status || !Number.isFinite(amount)) {
    throw new Error("DePix: resposta de consulta sem campos obrigatórios.");
  }

  return {
    id,
    status,
    amount,
    metadata,
  };
}
