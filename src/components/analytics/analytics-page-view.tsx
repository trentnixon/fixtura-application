"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { capturePageView } from "@/lib/analytics";

import { useAnalyticsReady } from "./analytics-provider";

export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ready = useAnalyticsReady();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;
    capturePageView(path);
  }, [pathname, searchParams, ready]);

  return null;
}
