"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthState } from "@/modules/auth/hooks/useAuthState";

const ADMIN_ROLE = "admin";

export function useAdminCheck() {
  const { user, loading: authLoading } = useAuthState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!authLoading && !user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const hasRole = (data?.role as string) === ADMIN_ROLE;
      setIsAdmin(hasRole);
      setLoading(false);
    };

    checkAdmin();
  }, [user?.id, authLoading, supabase]);

  return { isAdmin, loading: authLoading || loading };
}
