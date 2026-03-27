import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminAuthEnv } from "@/lib/env.server";
import {
  COOKIE_NAME,
  createAdminSessionToken,
} from "@/services/admin/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
    return res;
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Senha obrigatória" }, { status: 400 });
  }

  let authEnv: ReturnType<typeof getAdminAuthEnv>;
  try {
    authEnv = getAdminAuthEnv();
  } catch {
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
  return res;
}
