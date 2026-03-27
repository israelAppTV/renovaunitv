import { createHash } from "crypto";

/** Valida `x-authenticity-token` conforme doc PagBank (SHA-256 de `token-payload` em hex). */
export function verifyPagBankWebhookSignature(
  rawBody: string,
  accountToken: string,
  headerToken: string | null
): boolean {
  if (!headerToken) return false;
  const expected = createHash("sha256")
    .update(`${accountToken}-${rawBody}`, "utf8")
    .digest("hex");
  const a = expected.toLowerCase();
  const b = headerToken.trim().toLowerCase();
  return a === b;
}
