import crypto from "node:crypto";

interface ParsedSignature {
  timestamp: string;
  signatureV1: string;
}

function parseDepixSignature(header: string | null): ParsedSignature | null {
  if (!header) return null;
  const parts = header
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split("=", 2));
  const map = new Map(parts.map(([k, v]) => [k, v ?? ""]));
  const timestamp = map.get("t") ?? "";
  const signatureV1 = map.get("v1") ?? "";
  if (!timestamp || !signatureV1) return null;
  return { timestamp, signatureV1 };
}

export function verifyDepixWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  const parsed = parseDepixSignature(signatureHeader);
  if (!parsed) return false;
  const ts = Number(parsed.timestamp);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - ts) > toleranceSeconds) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(parsed.signatureV1, "hex");
  if (expectedBuffer.length === 0 || expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
