"use client";

import { useQuery } from "@tanstack/react-query";

export type SessionState = {
  authenticated: boolean;
};

async function fetchSession(): Promise<SessionState> {
  const res = await fetch("/api/auth/session", { credentials: "same-origin" });
  if (!res.ok) {
    return { authenticated: false };
  }
  return (await res.json()) as SessionState;
}

/**
 * Client-side session awareness for UX only. Route protection remains in middleware.
 */
export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 60_000,
  });
}
