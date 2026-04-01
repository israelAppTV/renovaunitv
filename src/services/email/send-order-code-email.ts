import "server-only";
import { Resend } from "resend";

/**
 * Remetente permitido pelo Resend sem domínio próprio verificado (conta gratuita / testes).
 * @see https://resend.com/docs/send-with-nextjs
 */
const RESEND_DEFAULT_FROM_NO_DOMAIN = "onboarding@resend.dev";

function getEmailConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey.length < 10) return null;

  const explicit = process.env.RESEND_FROM?.trim();
  const from = explicit || RESEND_DEFAULT_FROM_NO_DOMAIN;

  return { apiKey, from };
}

export async function sendOrderCodeEmail(options: {
  to: string;
  productName: string;
  code: string;
  orderId: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const cfg = getEmailConfig();
  if (!cfg) {
    console.warn(
      "[email] RESEND_API_KEY ausente — código não enviado por e-mail."
    );
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
