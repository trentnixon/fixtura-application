"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { SupportReadOnlyUnavailable } from "@/lib/support/support-read-only-unavailable";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import { ClubLogoDirectoryPanel } from "./club-logo-directory-panel";
import { ClubLogosAssociationNotice } from "./club-logos-association-notice";
import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";
import { useClubLogosScreen } from "../_hooks/use-club-logos-screen";

import type { ClubLogosScreenProps } from "../_types";

export function ClubLogosScreen({ accountId }: ClubLogosScreenProps) {
  const readOnly = useAccountReadOnly();
  const view = useClubLogosScreen(accountId);

  if (readOnly) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <SupportReadOnlyUnavailable
          accountId={accountId}
          backHref={`/o/${encodeURIComponent(accountId)}/dashboard`}
          backLabel="Back to dashboard"
        />
      </div>
    );
  }

  if (view.kind === "redirecting") {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>{CLUB_LOGOS_SCREEN_COPY.redirecting}</p>
      </div>
    );
  }

  if (view.kind === "loading") {
    return <BrandedLoader label={CLUB_LOGOS_SCREEN_COPY.loadingLabel} />;
  }

  if (view.kind === "error") {
    return (
      <ErrorState
        title={CLUB_LOGOS_SCREEN_COPY.errorTitle}
        description={view.message}
        onRetry={view.onRetry}
      />
    );
  }

  if (view.kind === "idle") {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-[88rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <PageHeader
        title={CLUB_LOGOS_SCREEN_COPY.pageTitle}
        description={CLUB_LOGOS_SCREEN_COPY.pageDescription}
        className="mb-2"
      />
      <ClubLogosAssociationNotice />
      <ClubLogoDirectoryPanel accountId={accountId} />
    </div>
  );
}
