"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { initAnalytics, isAnalyticsReady, subscribeAnalyticsReady } from "@/lib/analytics";

import { AnalyticsPageView } from "./analytics-page-view";

const AnalyticsReadyContext = createContext(false);

export function useAnalyticsReady(): boolean {
  return useContext(AnalyticsReadyContext);
}

function AnalyticsInit({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const syncReady = useCallback(() => {
    initAnalytics();
    onReadyChange(isAnalyticsReady());
  }, [onReadyChange]);

  useEffect(() => {
    syncReady();
    const unsubscribeReady = subscribeAnalyticsReady(() => {
      onReadyChange(isAnalyticsReady());
    });

    return unsubscribeReady;
  }, [syncReady, onReadyChange]);

  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  return (
    <AnalyticsReadyContext.Provider value={ready}>
      <AnalyticsInit onReadyChange={setReady} />
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      {children}
    </AnalyticsReadyContext.Provider>
  );
}
