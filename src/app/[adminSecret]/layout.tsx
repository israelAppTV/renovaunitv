import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface AdminSecretLayoutProps {
  children: ReactNode;
  params: { adminSecret: string };
}

export default function AdminSecretLayout({
  children,
  params,
}: AdminSecretLayoutProps) {
  const expected = process.env.ADMIN_PANEL_SECRET;
  if (!expected || params.adminSecret !== expected) {
    notFound();
  }
  return <>{children}</>;
}
