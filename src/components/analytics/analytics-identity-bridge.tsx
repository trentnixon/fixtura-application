"use client";

import { useEffect, useRef } from "react";

import { identifyUser } from "@/lib/analytics";
import { useCurrentUser } from "@/lib/api/hooks/auth/useCurrentUser";

export function AnalyticsIdentityBridge() {
  const { data } = useCurrentUser();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = data?.user?.id;
    if (!userId) return;

    const id = String(userId);
    if (identifiedUserIdRef.current === id) return;
    identifiedUserIdRef.current = id;
    identifyUser(id);
  }, [data?.user?.id]);

  return null;
}
