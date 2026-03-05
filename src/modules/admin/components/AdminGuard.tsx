"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/modules/auth";
import { useAdminCheck } from "@/modules/admin/hooks/useAdminCheck";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="text-sm text-gray-500">Verificando permissão...</span>
      </div>
    );
  }

  if (!isAdmin) {
    router.replace("/");
    return null;
  }

  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
