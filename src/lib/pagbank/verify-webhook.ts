import { createHash } from "crypto";

/** SHA-256 hex de `{token}-{rawBody}` — doc: confirmar autenticidade da notificação PagBank. */
export function verifyPagBankWebhookSignature(
  rawBody: string,
  accountToken: string,
  headerToken: string | null
): boolean {
  if (!headerToken?.trim()) return false;
  const token = accountToken.trim();
  const expected = createHash("sha256")
    .update(`${token}-${rawBody}`, "utf8")
    .digest("hex");
  const a = expected.toLowerCase();
  const b = headerToken.trim().toLowerCase();
  return a === b;
}

/** `PAGBANK_API_BASE_URL` apontando para hosts de teste (sandbox não envia header em alguns casos). */
export function isPagBankSandboxApiBaseUrl(apiBaseUrl: string): boolean {
  return apiBaseUrl.toLowerCase().includes("sandbox");
}
