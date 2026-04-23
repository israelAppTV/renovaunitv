import "server-only";
import { z } from "zod";

const depixEnvSchema = z.object({
  DEPIX_API_KEY: z.string().min(1),
  DEPIX_WEBHOOK_SECRET: z.string().min(1),
  DEPIX_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("https://depix-backend.vercel.app"),
});

export type DepixEnv = z.infer<typeof depixEnvSchema> & {
  DEPIX_API_BASE_URL: string;
};

let cached: DepixEnv | null = null;

export function getDepixEnv(): DepixEnv {
  if (cached) return cached;
  const parsed = depixEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `DePix: env inválido: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }
  const base = parsed.data.DEPIX_API_BASE_URL.replace(/\/$/, "");
  cached = { ...parsed.data, DEPIX_API_BASE_URL: base };
  return cached;
}
