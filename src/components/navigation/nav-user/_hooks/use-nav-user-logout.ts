"use client";

import { toast } from "sonner";

import { useLogout } from "@/lib/api/hooks/auth/useLogout";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import type { MouseEvent } from "react";

export function useNavUserLogout() {
  const logout = useLogout();

  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    if (logout.isPending) return;

    try {
      await logout.mutateAsync();
      toast.success(AUTH_ERROR_MESSAGES.loggedOut);
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.unexpected);
    }
  };

  return { logout, handleLogout };
}
