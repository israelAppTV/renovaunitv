import "server-only";
import { z } from "zod";

const pagbankEnvSchema = z.object({
  PAGBANK_TOKEN: z.string().min(10),
  PAGBANK_API_BASE_URL: z.string().url().optional(),
});

export type PagBankEnv = z.infer<typeof pagbankEnvSchema> & {
  PAGBANK_API_BASE_URL: string;
};

let cached: PagBankEnv | null = null;

export function getPagBankEnv(): PagBankEnv {
  if (cached) return cached;
  const parsed = pagbankEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `PagBank: env inválido: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }
  const base =
    parsed.data.PAGBANK_API_BASE_URL ?? "https://sandbox.api.pagseguro.com";
  cached = { ...parsed.data, PAGBANK_API_BASE_URL: base };
  return cached;
}
