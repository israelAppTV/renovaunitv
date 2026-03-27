import "server-only";

/** URL pública do site (redirects PagBank, webhooks). Sem barra final. */
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

const PAGBANK_URL_HELP =
  "O PagBank não aceita localhost em redirect/webhook. Use um túnel HTTPS (ex.: ngrok http 3000) e defina NEXT_PUBLIC_SITE_URL=https://SEU_SUBDOMINIO.ngrok-free.app (reinicie o npm run dev). Em produção, use o domínio real com HTTPS.";

/**
 * PagBank valida redirect_url, return_url e notification_urls — rejeita localhost e costuma exigir HTTPS.
 */
export function assertUrlAllowedForPagBankCallbacks(baseUrl: string): void {
  let u: URL;
  try {
    u = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
  } catch {
    throw new Error(`${PAGBANK_URL_HELP} URL atual inválida.`);
  }

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    throw new Error(PAGBANK_URL_HELP);
  }

  if (u.protocol !== "https:") {
    throw new Error(
      `${PAGBANK_URL_HELP} Use https:// na NEXT_PUBLIC_SITE_URL (túneis como ngrok fornecem HTTPS).`
    );
  }
}
