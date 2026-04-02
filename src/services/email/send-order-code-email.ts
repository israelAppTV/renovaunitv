import "server-only";
import { Resend } from "resend";

/**
 * Remetente de teste do Resend: só pode enviar para o e-mail da sua conta Resend.
 * Em produção use RESEND_FROM com endereço do domínio verificado.
 */
const RESEND_TEST_ONLY_FROM = "onboarding@resend.dev";

/**
 * Em produção: exige RESEND_FROM (@domínio verificado no Resend).
 * Em desenvolvimento: usa onboarding@resend.dev se RESEND_FROM estiver vazio.
 * Opcional: RESEND_ALLOW_RESEND_DEV_SENDER=true em produção para forçar o remetente de teste (não use para clientes reais).
 */
function resolveResendFrom(): string | null {
  const explicit = process.env.RESEND_FROM?.trim();
  if (explicit) return explicit;

  const isProd = process.env.NODE_ENV === "production";
  const allowTestSender =
    process.env.RESEND_ALLOW_RESEND_DEV_SENDER === "true";

  if (!isProd || allowTestSender) {
    return RESEND_TEST_ONLY_FROM;
  }

  return null;
}

function getEmailConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey.length < 10) return null;

  const from = resolveResendFrom();
  if (!from) return null;

  return { apiKey, from };
}

export async function sendOrderCodeEmail(options: {
  to: string;
  productName: string;
  code: string;
  orderId: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const hasKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const cfg = getEmailConfig();

  if (!cfg) {
    if (!hasKey) {
      console.warn(
        "[email] RESEND_API_KEY ausente — código não enviado por e-mail."
      );
    } else {
      console.warn(
        "[email] RESEND_FROM ausente em produção. Defina um remetente do domínio verificado no Resend (ex.: \"UniTV <noreply@renovaunitv.com.br>\")."
      );
    }
    return { sent: false, reason: "email_not_configured" };
  }

  const { apiKey, from } = cfg;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: `Seu código de ativação — ${options.productName}`,
    html: `
      <p>Olá,</p>
      <p>O pagamento do seu pedido foi confirmado. Segue o código de ativação:</p>
      <p style="font-size:18px;font-weight:bold;font-family:monospace;letter-spacing:1px;">${escapeHtml(
        options.code
      )}</p>
      <p>Produto: ${escapeHtml(options.productName)}</p>
      <p style="color:#666;font-size:12px;">Referência do pedido: ${escapeHtml(
        options.orderId
      )}</p>
    `,
  });

  if (error) {
    console.error("[email] Resend:", error);
    return { sent: false, reason: error.message };
  }

  console.info("[email] código enviado (pedido)", options.orderId);
  return { sent: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
