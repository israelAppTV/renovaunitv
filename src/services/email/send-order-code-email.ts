import "server-only";
import { Resend } from "resend";
import { z } from "zod";

const emailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(10).optional(),
  RESEND_FROM: z.string().email().optional(),
});

function getEmailConfig(): { apiKey?: string; from?: string } {
  const p = emailEnvSchema.safeParse(process.env);
  if (!p.success) return {};
  return {
    apiKey: p.data.RESEND_API_KEY,
    from: p.data.RESEND_FROM,
  };
}

export async function sendOrderCodeEmail(options: {
  to: string;
  productName: string;
  code: string;
  orderId: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const { apiKey, from } = getEmailConfig();
  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY ou RESEND_FROM ausente — código não enviado por e-mail."
    );
    return { sent: false, reason: "email_not_configured" };
  }

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

  return { sent: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
