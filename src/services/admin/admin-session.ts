import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { getAdminAuthEnv } from "@/lib/env.server";

const COOKIE_NAME = "admin_session";

function getJwtSecret() {
  return new TextEncoder().encode(getAdminAuthEnv().ADMIN_SESSION_SECRET);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
}

export async function verifyAdminSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function requireAdminSessionOrRedirect(): Promise<void> {
  if (!(await verifyAdminSessionFromCookies())) {
    const secret = process.env.ADMIN_PANEL_SECRET;
    redirect(secret ? `/${secret}` : "/");
  }
}

export { COOKIE_NAME };
