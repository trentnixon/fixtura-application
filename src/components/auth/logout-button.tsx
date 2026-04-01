"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { postLogoutRequest } from "@/lib/auth/logout-client";
import { getLogoutRedirectPath } from "@/lib/config/logout-redirect";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      const res = await postLogoutRequest();
      if (!res.ok) throw new Error("Logout failed");
      queryClient.clear();
      toast.success(AUTH_ERROR_MESSAGES.loggedOut);
      router.push(getLogoutRedirectPath());
      router.refresh();
    } catch {
      toast.error(AUTH_ERROR_MESSAGES.unexpected);
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onLogout}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
