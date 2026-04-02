/**
 * Testa envio Resend sem domínio (usa onboarding@resend.dev se RESEND_FROM estiver vazio).
 * Uso: node scripts/test-resend.mjs seu@email.com
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Resend } from "resend";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) {
    console.error("Arquivo .env.local não encontrado.");
    process.exit(1);
  }
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvLocal();

const apiKey = process.env.RESEND_API_KEY?.trim();
const explicitFrom = process.env.RESEND_FROM?.trim();
const from = explicitFrom || "onboarding@resend.dev";
const to = process.argv[2]?.trim();

if (!apiKey || apiKey.length < 10) {
  console.error("Defina RESEND_API_KEY em .env.local");
  process.exit(1);
}
if (!to) {
  console.error("Uso: node scripts/test-resend.mjs seu@email.com");
  process.exit(1);
}
if (!explicitFrom) {
  console.warn(
    "Sem RESEND_FROM: usando onboarding@resend.dev — o Resend só entrega para o e-mail da conta. Para testar outro destinatário, defina RESEND_FROM=nome@seu-dominio-verificado.com.br"
  );
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to: [to],
  subject: "Teste Resend — UniTV",
  html: "<p>Se você recebeu isto, o Resend está configurado.</p>",
});

if (error) {
  console.error("Erro:", error);
  process.exit(1);
}
console.log("Enviado.", data?.id ?? "");
