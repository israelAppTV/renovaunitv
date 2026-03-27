import "server-only";
import { z } from "zod";

/** Só senha admin + cookie JWT — não exige Supabase (permite logar antes de colar service_role). */
const adminAuthEnvSchema = z.object({
  ADMIN_PASSWORD_BCRYPT_HASH: z.string().min(20),
  ADMIN_SESSION_SECRET: z.string().min(32),
});

export type AdminAuthEnv = z.infer<typeof adminAuthEnvSchema>;

let cachedAuth: AdminAuthEnv | null = null;

export function getAdminAuthEnv(): AdminAuthEnv {
  if (cachedAuth) return cachedAuth;
  const parsed = adminAuthEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const detail = JSON.stringify(parsed.error.flatten().fieldErrors);
    throw new Error(`Env admin inválido: ${detail}`);
  }
  cachedAuth = parsed.data;
  return parsed.data;
}

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_PANEL_SECRET: z.string().min(16),
  ADMIN_PASSWORD_BCRYPT_HASH: z.string().min(20),
  ADMIN_SESSION_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const detail = JSON.stringify(parsed.error.flatten().fieldErrors);
    throw new Error(`Env servidor inválido (admin / Supabase): ${detail}`);
  }
  cached = parsed.data;
  return parsed.data;
}
