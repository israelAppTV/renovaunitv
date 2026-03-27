import { z } from "zod";

/** Variáveis públicas (build e browser). Sem chaves de serviço. */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

if (!parsed.success) {
  const detail = JSON.stringify(parsed.error.flatten().fieldErrors);
  throw new Error(`Variáveis de ambiente inválidas: ${detail}`);
}

export const env = parsed.data;
