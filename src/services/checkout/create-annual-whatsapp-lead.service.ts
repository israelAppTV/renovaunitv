import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const DEFAULT_SUPPORT_PHONE = "5562998060804";
type PlanSlug = "mensal" | "anual";

function extractWhatsappPhone(rawUrl: string | undefined): string {
  const source = (rawUrl ?? "").trim();
  if (!source) return DEFAULT_SUPPORT_PHONE;

  const digits = source.replace(/\D/g, "");
  if (digits.length >= 10) return digits;

  return DEFAULT_SUPPORT_PHONE;
}

function buildMessage(input: {
  planSlug: PlanSlug;
  customerName: string;
  customerEmail: string;
  taxIdDigits: string;
  phoneArea: string;
  phoneNumber: string;
}): string {
  const planLabel = input.planSlug === "anual" ? "anual" : "mensal";
  return [
    `Vim pelo site e gostaria de comprar o plano ${planLabel}.`,
    "",
    "Dados do cliente:",
    `Nome: ${input.customerName.trim()}`,
    `E-mail: ${input.customerEmail.trim().toLowerCase()}`,
    `CPF/CNPJ: ${input.taxIdDigits}`,
    `Telefone: (${input.phoneArea}) ${input.phoneNumber}`,
  ].join("\n");
}

export interface CreateAnnualWhatsappLeadInput {
  planSlug: PlanSlug;
  customerName: string;
  customerEmail: string;
  taxIdDigits: string;
  phoneArea: string;
  phoneNumber: string;
  clientIp: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
}

export interface CreateWhatsappLeadResult {
  leadId: string;
  whatsappUrl: string;
}

export async function createWhatsappLead(
  input: CreateAnnualWhatsappLeadInput
): Promise<CreateWhatsappLeadResult> {
  const phone = extractWhatsappPhone(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL);
  const messageText = buildMessage(input);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("annual_whatsapp_leads")
    .insert({
      plan_slug: input.planSlug,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_tax_id: input.taxIdDigits,
      customer_phone_area: input.phoneArea,
      customer_phone_number: input.phoneNumber,
      ip_address: input.clientIp,
      user_agent: input.userAgent,
      device_fingerprint: input.deviceFingerprint,
      whatsapp_url: whatsappUrl,
      message_text: messageText,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error("Não foi possível registrar seu pedido no WhatsApp no momento.");
  }

  return { leadId: data.id, whatsappUrl };
}
