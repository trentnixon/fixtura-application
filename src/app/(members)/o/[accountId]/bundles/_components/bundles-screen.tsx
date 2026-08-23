"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { TypographyMuted } from "@/components/typography";
import { ErrorState } from "@/components/ui/error-state";
import { captureEvent } from "@/lib/analytics";

import { BundlesActiveRunBanner } from "./bundles-active-run-banner";
import { BundlesRenderListPanel } from "./bundles-render-list-panel";
import { BundlesSchedulerStrip } from "./bundles-scheduler-strip";
import { BundlesScreenHeader } from "./bundles-screen-header";
import { BUNDLES_SCREEN_COPY } from "../_consts";
import { useBundlesScreen } from "../_hooks/use-bundles-screen";

import type { BundlesScreenProps } from "../_types";

export function BundlesScreen({ accountId }: BundlesScreenProps) {
  const view = useBundlesScreen(accountId);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (view.kind !== "ready" || viewedRef.current) return;
    viewedRef.current = true;
    captureEvent("user_action", { action: "bundles_viewed", accountId });
  }, [accountId, view.kind]);

  if (view.kind === "redirecting") {
    return (
      <div
        className="text-muted-foreground mx-auto grid max-w-[112rem] gap-2 px-4 pb-12 text-center text-sm sm:px-6 lg:px-8"
        role="status"
      >
        <TypographyMuted>{BUNDLES_SCREEN_COPY.redirecting}</TypographyMuted>
      </div>
    );
  }

  if (view.kind === "loading") {
    return (
      <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
          <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
          <p className="text-muted-foreground text-sm">{BUNDLES_SCREEN_COPY.loadingLabel}</p>
        </div>
      </div>
    );
  }

  if (view.kind === "error") {
    return (
      <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        <ErrorState
          title={BUNDLES_SCREEN_COPY.errorTitle}
          description={view.message}
          onRetry={view.onRetry}
        />
      </div>
    );
  }

  if (view.kind === "idle") {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <BundlesScreenHeader accountId={accountId} />
      <BundlesActiveRunBanner accountId={accountId} />
      <BundlesRenderListPanel accountId={accountId} />
      <BundlesSchedulerStrip accountId={accountId} />
    </div>
  );
}
