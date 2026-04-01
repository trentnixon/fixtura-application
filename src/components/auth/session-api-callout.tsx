"use client";

import { useEffect, useState } from "react";

import { apiFetchJson } from "@/lib/api";

type SessionPayload = {
  authenticated: boolean;
};

/**
 * Demonstrates authenticated `apiFetchJson` usage on a protected page (Phase 7 shell validation).
 * Session UX remains driven by `MembersSessionBoundary`; this is a thin proof of the API client pattern.
 */
export function SessionApiCallout() {
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetchJson<SessionPayload>("/api/auth/session")
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Could not load session check via API client.
      </p>
    );
  }

  if (!payload) {
    return (
      <p className="text-muted-foreground text-sm" role="status">
        Verifying session via <code className="text-xs">apiFetchJson</code>…
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm" role="status">
      Session check (centralised client):{" "}
      <span className="text-foreground font-medium">
        {payload.authenticated ? "authenticated" : "not authenticated"}
      </span>
    </p>
  );
}
