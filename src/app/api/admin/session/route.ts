import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminAuthEnv } from "@/lib/env.server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  COOKIE_NAME,
  createAdminSessionToken,
} from "@/services/admin/admin-session";

export const dynamic = "force-dynamic";

const LOGIN_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

async function getRecentFailedAttempts(ip: string | null): Promise<number> {
  if (!ip) return 0;
  try {
    const supabase = createServiceRoleClient();
    const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("admin_auth_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("success", false)
      .gte("created_at", since);
    return count ?? 0;
  } catch (e) {
    console.error("[admin-auth] falha ao consultar tentativas recentes", e);
    return 0;
  }
}

async function writeAdminAuthEvent(params: {
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  reason: string;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("admin_auth_events").insert({
      ip_address: params.ip,
      user_agent: params.userAgent,
      success: params.success,
      reason: params.reason,
    });
  } catch (e) {
    console.error("[admin-auth] falha ao registrar auditoria", e);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");
  let body: { password?: string; logout?: boolean };
  try {
    body = (await request.json()) as { password?: string; logout?: boolean };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.logout) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    await writeAdminAuthEvent({
      ip,
      userAgent,
      success: true,
      reason: "logout",
    });
    return res;
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    await writeAdminAuthEvent({
      ip,
      userAgent,
      success: false,
      reason: "invalid_payload",
    });
    return NextResponse.json({ error: "Senha obrigatória" }, { status: 400 });
  }

  const failedAttempts = await getRecentFailedAttempts(ip);
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    await writeAdminAuthEvent({
      ip,
      userAgent,
      success: false,
      reason: "rate_limited",
    });
    return NextResponse.json(
      {
        error:
          "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
      },
      { status: 429 }
    );
  }

  let authEnv: ReturnType<typeof getAdminAuthEnv>;
  try {
    authEnv = getAdminAuthEnv();
  } catch {
    await writeAdminAuthEvent({
      ip,
      userAgent,
      success: false,
      reason: "server_unconfigured",
    });
    return NextResponse.json(
      {
        error:
          "Configuração incompleta: defina ADMIN_PASSWORD_BCRYPT_HASH e ADMIN_SESSION_SECRET no .env.local",
      },
      { status: 500 }
    );
  }

  const match = await bcrypt.compare(password, authEnv.ADMIN_PASSWORD_BCRYPT_HASH);
  if (!match) {
    await writeAdminAuthEvent({
      ip,
      userAgent,
      success: false,
      reason: "invalid_credentials",
    });
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  await writeAdminAuthEvent({
    ip,
    userAgent,
    success: true,
    reason: "login_success",
  });
  return res;
}
