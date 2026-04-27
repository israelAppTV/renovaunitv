import "server-only";
import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface PreCheckoutRiskInput {
  customerName: string;
  customerEmail: string;
  taxIdDigits: string;
  phoneArea: string;
  phoneNumber: string;
  clientIp: string | null;
  deviceFingerprint?: string | null;
}

export interface PreCheckoutRiskResult {
  blocked: boolean;
  reason: string | null;
  flags: string[];
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(area: string, number: string): string {
  return `${area.replace(/\D/g, "").slice(0, 2)}${number.replace(/\D/g, "").slice(0, 9)}`;
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hasSuspiciousHolderPattern(name: string, taxIdDigits: string): string | null {
  const normalized = normalizeName(name);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length < 2) return "holder_name_missing_surname";
  if (/^(teste|test|asdf|qwerty|admin)$/.test(normalized)) return "holder_name_synthetic";
  if (/(.)\1{4,}/.test(normalized.replace(/\s/g, ""))) return "holder_name_repeated_chars";
  if (!/^\d{11}$|^\d{14}$/.test(taxIdDigits)) return "holder_taxid_invalid_format";
  return null;
}

async function isBlocked(
  type: "cpf" | "email" | "ip" | "phone" | "device_fingerprint",
  normalizedValue: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const valueHash = sha256(normalizedValue);
  const { data } = await supabase
    .from("fraud_blocklist")
    .select("id")
    .eq("block_type", type)
    .eq("active", true)
    .eq("value_hash", valueHash)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function evaluatePreCheckoutRisk(
  input: PreCheckoutRiskInput
): Promise<PreCheckoutRiskResult> {
  const flags: string[] = [];
  const supabase = createServiceRoleClient();
  const email = normalizeEmail(input.customerEmail);
  const phone = normalizePhone(input.phoneArea, input.phoneNumber);
  const taxId = input.taxIdDigits;
  const ip = input.clientIp?.trim() ?? null;
  const deviceFingerprint = input.deviceFingerprint?.trim() ?? null;

  const holderFlag = hasSuspiciousHolderPattern(input.customerName, taxId);
  if (holderFlag) flags.push(holderFlag);

  const blockedChecks = await Promise.all([
    isBlocked("email", email),
    isBlocked("cpf", taxId),
    isBlocked("phone", phone),
    ip ? isBlocked("ip", ip) : Promise.resolve(false),
    deviceFingerprint ? isBlocked("device_fingerprint", deviceFingerprint) : Promise.resolve(false),
  ]);
  if (blockedChecks[0]) flags.push("blocklist_email");
  if (blockedChecks[1]) flags.push("blocklist_cpf");
  if (blockedChecks[2]) flags.push("blocklist_phone");
  if (blockedChecks[3]) flags.push("blocklist_ip");
  if (blockedChecks[4]) flags.push("blocklist_device");

  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const [byEmail, byTaxId, byPhone, byIp] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", email)
      .gte("created_at", since),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_tax_id", taxId)
      .gte("created_at", since),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_phone_number", phone.slice(2))
      .eq("customer_phone_area", phone.slice(0, 2))
      .gte("created_at", since),
    ip
      ? supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("ip_address", ip)
          .gte("created_at", since)
      : Promise.resolve({ count: 0 } as { count: number | null }),
  ]);

  if ((byEmail.count ?? 0) >= 3) flags.push("velocity_email_5m");
  if ((byTaxId.count ?? 0) >= 3) flags.push("velocity_taxid_5m");
  if ((byPhone.count ?? 0) >= 3) flags.push("velocity_phone_5m");
  if ((byIp.count ?? 0) >= 5) flags.push("velocity_ip_5m");

  const blocked = flags.some((f) => f.startsWith("blocklist_")) ||
    flags.includes("velocity_email_5m") ||
    flags.includes("velocity_taxid_5m") ||
    flags.includes("velocity_phone_5m") ||
    flags.includes("velocity_ip_5m") ||
    flags.includes("holder_name_synthetic");

  return {
    blocked,
    reason: blocked ? flags[0] ?? "risk_blocked" : null,
    flags,
  };
}
