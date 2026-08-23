"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { TypographyMuted } from "@/components/typography";
import { ErrorState } from "@/components/ui/error-state";
import { FeedbackCardSoft, FeedbackCardStrong } from "@/components/ui/feedback-card";
import { captureEvent } from "@/lib/analytics";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BundlesRenderDetailHeader } from "./bundles-render-detail-header";
import { BundlesRenderDetailSummary } from "./bundles-render-detail-summary";
import { BundlesRenderDownloadsPanel } from "./bundles-render-downloads-panel";
import { BUNDLES_SCREEN_COPY } from "../_consts";
import { useBundlesAccountSport } from "../_hooks/use-bundles-account-sport";
import { useBundlesRenderDetailScreen } from "../_hooks/use-bundles-render-detail-screen";

import type { BundlesRenderDetailScreenProps } from "../_types";

export function BundlesRenderDetailScreen({ accountId, renderId }: BundlesRenderDetailScreenProps) {
  const router = useRouter();
  const view = useBundlesRenderDetailScreen(accountId, renderId);
  const sport = useBundlesAccountSport(accountId, {
    enabled: view.kind === "ready",
  });
  const bundlesHref = accountScopedRoutes.bundles(accountId);
  const viewedRef = useRef(false);
  const packRenderId = view.kind === "ready" ? view.render.id : null;

  useEffect(() => {
    if (packRenderId == null || viewedRef.current) return;
    viewedRef.current = true;
    captureEvent("pack_viewed", {
      accountId,
      renderId: packRenderId,
    });
  }, [accountId, packRenderId]);

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
          <p className="text-muted-foreground text-sm">{BUNDLES_SCREEN_COPY.detailLoadingLabel}</p>
        </div>
      </div>
    );
  }

  if (view.kind === "error") {
    return (
      <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        <ErrorState
          title={BUNDLES_SCREEN_COPY.detailErrorTitle}
          description={view.message}
          onRetry={view.onRetry}
        />
      </div>
    );
  }

  if (view.kind === "idle") {
    return null;
  }

  if (view.kind === "invalidRenderId") {
    return (
      <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        <FeedbackCardStrong
          kind="error"
          label={BUNDLES_SCREEN_COPY.feedbackErrorLabel}
          title={BUNDLES_SCREEN_COPY.detailErrorTitle}
          description={BUNDLES_SCREEN_COPY.invalidRenderId}
          primaryCta={BUNDLES_SCREEN_COPY.detailBackAction}
          onPrimaryAction={() => router.push(bundlesHref)}
        />
      </div>
    );
  }

  if (view.kind === "renderNotFound") {
    return (
      <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        <FeedbackCardSoft
          kind="warning"
          label={BUNDLES_SCREEN_COPY.feedbackWarningLabel}
          title={BUNDLES_SCREEN_COPY.detailErrorTitle}
          description={BUNDLES_SCREEN_COPY.renderNotFound}
          primaryCta={BUNDLES_SCREEN_COPY.detailBackAction}
          onPrimaryAction={() => router.push(bundlesHref)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[112rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <BundlesRenderDetailHeader accountId={accountId} render={view.render} />
      <BundlesRenderDownloadsPanel accountId={accountId} sport={sport} render={view.render} />
      <BundlesRenderDetailSummary render={view.render} />
    </div>
  );
}
