"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/api/hooks/auth/useLogout";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

/**
 * Standard logout button that uses the centralized useLogout hook.
 */
export function LogoutButton() {
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success(AUTH_ERROR_MESSAGES.loggedOut);
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.unexpected);
    }
  };

  const isPending = logout.isPending;

  return (
    <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleLogout}>
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
