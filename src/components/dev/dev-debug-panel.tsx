"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PANEL_VIEW_STORAGE_KEY = "fixtura-dev-debug-panel-view";

type SessionData = {
  user?: {
    id?: string | number;
    email?: string;
    [key: string]: any;
  };
  expires?: string;
} | null;

type PanelViewMode = "expanded" | "shrink" | "hidden";

function readStoredPanelView(): PanelViewMode {
  if (typeof window === "undefined") return "expanded";
  const v = window.sessionStorage.getItem(PANEL_VIEW_STORAGE_KEY);
  if (v === "expanded" || v === "shrink" || v === "hidden") return v;
  return "expanded";
}

const shellClass =
  "z-9999 rounded-md border border-green-900/50 bg-black/95 font-mono text-xs text-green-400 shadow-xl backdrop-blur-md";

const headerBarClass = "border-b border-green-800 flex items-center justify-between gap-2 min-w-0";

export function DevDebugPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  const [lastApiError, setLastApiError] = useState<{ status: number; url: string } | null>(null);
  const [viewMode, setViewMode] = useState<PanelViewMode>(readStoredPanelView);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(PANEL_VIEW_STORAGE_KEY, viewMode);
    } catch {
      // ignore (private mode, quota)
    }
  }, [viewMode]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
        } else {
          setSessionData(null);
        }
      } catch {
        setSessionData(null);
      }
    };

    fetchSession();

    const interval = setInterval(() => {
      const globalError = (window as any).__LAST_API_ERROR__;
      if (globalError) {
        setLastApiError(globalError);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pathname]);

  const clearApiError = useCallback(() => {
    (window as any).__LAST_API_ERROR__ = null;
    setLastApiError(null);
  }, []);

  if (process.env.NODE_ENV !== "development" || !isMounted) {
    return null;
  }

  const queryStr = searchParams.toString();

  return (
    <div className="hidden md:block" aria-label="Dev debug">
      {viewMode === "hidden" ? (
        <button
          type="button"
          onClick={() => setViewMode("expanded")}
          className={`fixed right-4 bottom-4 z-9999 flex h-8 items-center gap-1 rounded-md border border-green-800/80 bg-black/95 px-2 font-mono text-[10px] font-bold text-green-500 shadow-lg backdrop-blur-md hover:border-green-600 hover:text-green-300`}
          title="Show Dev Debug Panel"
        >
          <span aria-hidden>⚙</span> Dev
        </button>
      ) : null}

      {viewMode === "shrink" ? (
        <div
          className={`fixed right-4 bottom-4 w-72 max-w-[calc(100vw-2rem)] ${shellClass} overflow-hidden p-2`}
        >
          <div className={`${headerBarClass} border-b-0 pb-0`}>
            <h3 className="truncate text-[11px] font-bold text-green-300">⚙️ Dev Debug</h3>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("expanded")}
                className="text-[10px] text-green-500 hover:text-green-300"
                title="Expand panel"
              >
                [expand]
              </button>
              <button
                type="button"
                onClick={() => setViewMode("hidden")}
                className="text-[10px] text-green-500 hover:text-green-300"
                title="Hide panel (show dev chip only)"
              >
                [hide]
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewMode === "expanded" ? (
        <div
          className={`fixed right-4 bottom-4 z-9999 max-h-[80vh] w-72 max-w-[calc(100vw-2rem)] overflow-auto ${shellClass} p-4`}
        >
          <div className={`mb-3 pb-2 ${headerBarClass}`}>
            <h3 className="shrink-0 font-bold text-green-300">⚙️ Dev Debug Panel</h3>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 sm:flex-nowrap">
              <button
                type="button"
                onClick={clearApiError}
                className="text-[10px] text-green-700 hover:text-green-400"
                title="Clear API Error"
              >
                [clear]
              </button>
              <button
                type="button"
                onClick={() => setViewMode("shrink")}
                className="text-[10px] text-green-500 hover:text-green-300"
                title="Shrink to bar"
              >
                [shrink]
              </button>
              <button
                type="button"
                onClick={() => setViewMode("hidden")}
                className="text-[10px] text-green-500 hover:text-green-300"
                title="Hide to corner chip"
              >
                [hide]
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="mb-1 block font-semibold text-green-600">Route State</span>
              <div className="truncate text-green-200">Path: {pathname}</div>
              <div className="truncate text-green-500">Query: {queryStr || "empty"}</div>
            </div>

            <div>
              <span className="mb-1 block font-semibold text-green-600">Session State</span>
              <div className={`${sessionData ? "text-green-300" : "text-yellow-600"}`}>
                Auth: {sessionData ? "Authenticated" : "Not Authenticated"}
              </div>
              {sessionData?.expires && (
                <div className="text-green-500">
                  Expiry: {new Date(sessionData.expires).toLocaleString()}
                </div>
              )}
              {sessionData?.user && (
                <div className="truncate text-green-500">
                  User: {sessionData.user.id || sessionData.user.email || "Unknown"}
                </div>
              )}
            </div>

            <div>
              <span className="mb-1 block font-semibold text-green-600">API State</span>
              {lastApiError ? (
                <div className="rounded border border-red-900/50 bg-red-950/50 p-2 break-all text-red-400">
                  <div className="mb-1 font-bold">Status: {lastApiError.status}</div>
                  <div className="text-red-300">URL: {lastApiError.url}</div>
                </div>
              ) : (
                <div className="text-green-800 italic">No recent errors</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
