"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthState } from "@/modules/auth/hooks/useAuthState";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthState();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return <>{children}</>;
}
