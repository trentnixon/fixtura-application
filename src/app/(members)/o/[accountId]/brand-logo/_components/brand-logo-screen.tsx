"use client";

import { useBrandingScreen } from "@/app/(members)/o/[accountId]/branding/_components/_hooks";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { BrandLogoWorkspace } from "@/features/branding/components/brand-logo-workspace";

import { BRAND_LOGO_SCREEN_COPY } from "./_consts";

export type BrandLogoScreenProps = {
  accountId: string;
};

export function BrandLogoScreen({ accountId }: BrandLogoScreenProps) {
  const view = useBrandingScreen(accountId);

  if (view.kind === "redirecting") {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>{BRAND_LOGO_SCREEN_COPY.redirecting}</p>
      </div>
    );
  }

  if (view.kind === "loading") {
    return <BrandedLoader label={BRAND_LOGO_SCREEN_COPY.loadingLabel} />;
  }

  if (view.kind === "error") {
    return (
      <ErrorState
        title={BRAND_LOGO_SCREEN_COPY.errorTitle}
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
      <BrandLogoWorkspace accountId={accountId} data={view.data} />
    </div>
  );
}
