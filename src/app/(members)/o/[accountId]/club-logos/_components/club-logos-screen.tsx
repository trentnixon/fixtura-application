"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";

import { ClubLogoDirectoryPanel } from "./club-logo-directory-panel";
import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";
import { useClubLogosScreen } from "../_hooks/use-club-logos-screen";

import type { ClubLogosScreenProps } from "../_types";

export function ClubLogosScreen({ accountId }: ClubLogosScreenProps) {
  const view = useClubLogosScreen(accountId);

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
      <ClubLogoDirectoryPanel accountId={accountId} />
    </div>
  );
}
