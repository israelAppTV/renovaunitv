import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env.server";
import { getDepixEnv } from "@/lib/depix/env";
import { createCheckoutOrder } from "@/services/checkout/create-checkout-order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shouldHomologLog(): boolean {
  return process.env.DEPIX_HOMOLOG_LOGS === "true";
}

const bodySchema = z.object({
  planSlug: z.enum(["mensal", "anual"]),
  customer: z.object({
    name: z.string().min(3).max(200),
    email: z.string().email(),
    taxId: z.string().min(11).max(18),
    phoneArea: z.string().min(2).max(3),
    phoneNumber: z.string().min(9).max(11),
  }),
});

function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  try {
    getServerEnv();
    getDepixEnv();
  } catch {
    return NextResponse.json(
      { error: "Servidor não configurado." },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const taxDigits = parsed.data.customer.taxId.replace(/\D/g, "");
  if (taxDigits.length !== 11 && taxDigits.length !== 14) {
    return NextResponse.json({ error: "CPF/CNPJ inválido." }, { status: 400 });
  }

  const phoneArea = parsed.data.customer.phoneArea.replace(/\D/g, "").slice(0, 2);
  const phoneNumber = parsed.data.customer.phoneNumber.replace(/\D/g, "").slice(0, 9);
  if (phoneArea.length !== 2) {
    return NextResponse.json(
      { error: "DDD do celular inválido (2 dígitos)." },
      { status: 400 }
    );
  }
  if (phoneNumber.length !== 9 || !phoneNumber.startsWith("9")) {
    return NextResponse.json(
      {
        error:
          "Celular inválido: informe 9 dígitos começando com 9 (ex.: 987654321).",
      },
      { status: 400 }
    );
  }

  try {
    const result = await createCheckoutOrder({
      planSlug: parsed.data.planSlug,
      customerName: parsed.data.customer.name,
      customerEmail: parsed.data.customer.email,
      taxIdDigits: taxDigits,
      phoneArea,
      phoneNumber,
      clientIp: getClientIp(request),
    });
    if (shouldHomologLog()) {
      console.info("[homolog][depix] response /api/checkout", {
        ok: true,
        orderId: result.orderId,
        hasUrl: Boolean(result.payUrl),
      });
    }
    return NextResponse.json({
      url: result.payUrl,
      orderId: result.orderId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar checkout.";
    if (shouldHomologLog()) {
      console.error("[homolog][depix] error /api/checkout", { error: msg });
    }
    const status = msg.includes("estoque") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
