"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SessionData = {
  user?: {
    id?: string | number;
    email?: string;
    [key: string]: any;
  };
  expires?: string;
} | null;

export function DevDebugPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  const [lastApiError, setLastApiError] = useState<{ status: number; url: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (process.env.NODE_ENV !== "development" || !isMounted) {
    return null;
  }

  const queryStr = searchParams.toString();

  return (
    <div className="fixed right-4 bottom-4 z-[9999] max-h-[80vh] w-72 overflow-auto rounded-md border border-green-900/50 bg-black/95 p-4 font-mono text-xs text-green-400 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between border-b border-green-800 pb-2">
        <h3 className="font-bold text-green-300">⚙️ Dev Debug Panel</h3>
        <button
          onClick={() => {
            (window as any).__LAST_API_ERROR__ = null;
            setLastApiError(null);
          }}
          className="text-xs text-green-700 hover:text-green-400"
          title="Clear API Error"
        >
          [clear]
        </button>
      </div>

      <div className="space-y-4">
        {/* Route State */}
        <div>
          <span className="mb-1 block font-semibold text-green-600">Route State</span>
          <div className="truncate text-green-200">Path: {pathname}</div>
          <div className="truncate text-green-500">Query: {queryStr || "empty"}</div>
        </div>

        {/* Session State */}
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

        {/* API State */}
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
  );
}
