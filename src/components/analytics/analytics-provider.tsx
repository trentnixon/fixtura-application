"use client";

import { Suspense, useEffect, type ReactNode } from "react";

import { initAnalytics } from "@/lib/analytics";

import { AnalyticsPageView } from "./analytics-page-view";

function AnalyticsInit() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsInit />
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      {children}
    </>
  );
}
