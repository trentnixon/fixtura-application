"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { BrandingWorkspace } from "@/features/branding/components/branding-workspace";

import { BRANDING_SCREEN_COPY, BRANDING_SCREEN_WORKSPACE } from "./_consts";
import { useBrandingScreen } from "./_hooks";

import type { BrandingScreenProps } from "./_types";

export function BrandingScreen({ accountId }: BrandingScreenProps) {
  const view = useBrandingScreen(accountId);

  if (view.kind === "redirecting") {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>{BRANDING_SCREEN_COPY.redirecting}</p>
      </div>
    );
  }

  if (view.kind === "loading") {
    return <BrandedLoader label={BRANDING_SCREEN_COPY.loadingLabel} />;
  }

  if (view.kind === "error") {
    return (
      <ErrorState
        title={BRANDING_SCREEN_COPY.errorTitle}
        description={view.message}
        onRetry={view.onRetry}
      />
    );
  }

  if (view.kind === "idle") {
    return null;
  }

  return (
    <div className="grid gap-6">
      <BrandingWorkspace
        key={accountId}
        accountId={accountId}
        data={view.data}
        mode={BRANDING_SCREEN_WORKSPACE.mode}
        cmsSaveLabStub={BRANDING_SCREEN_WORKSPACE.cmsSaveLabStub}
      />
    </div>
  );
}
