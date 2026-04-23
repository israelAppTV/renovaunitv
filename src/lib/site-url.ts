import "server-only";

/** URL pública do site (redirects e webhooks). Sem barra final. */
export function getPublicSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

const CALLBACK_URL_HELP =
  "O provedor de pagamento não aceita localhost em callback/webhook. Use um túnel HTTPS (ex.: ngrok http 3000) e defina NEXT_PUBLIC_SITE_URL=https://SEU_SUBDOMINIO.ngrok-free.app (reinicie o npm run dev). Em produção, use o domínio real com HTTPS.";

/**
 * Provedores de pagamento geralmente validam callback_url e redirect_url, rejeitando localhost sem HTTPS.
 */
export function assertUrlAllowedForPaymentCallbacks(baseUrl: string): void {
  let u: URL;
  try {
    u = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
  } catch {
    throw new Error(`${CALLBACK_URL_HELP} URL atual inválida.`);
  }

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    throw new Error(CALLBACK_URL_HELP);
  }

  if (u.protocol !== "https:") {
    throw new Error(
      `${CALLBACK_URL_HELP} Use https:// na NEXT_PUBLIC_SITE_URL (túneis como ngrok fornecem HTTPS).`
    );
  }
}
