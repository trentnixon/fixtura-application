"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { SupportReadOnlyUnavailable } from "@/lib/support/support-read-only-unavailable";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import { ClubLogoEditorHeader } from "./club-logo-editor-header";
import { ClubLogoWorkspace } from "./club-logo-workspace";
import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";
import { useClubLogoEditorScreen } from "../_hooks/use-club-logo-editor-screen";

export type ClubLogoEditorScreenProps = {
  accountId: string;
  clubId: string;
};

export function ClubLogoEditorScreen({ accountId, clubId }: ClubLogoEditorScreenProps) {
  const readOnly = useAccountReadOnly();
  const view = useClubLogoEditorScreen(accountId, clubId);

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
    return <BrandedLoader label={CLUB_LOGOS_SCREEN_COPY.editorLoadingLabel} />;
  }

  if (view.kind === "error") {
    return (
      <ErrorState
        title={CLUB_LOGOS_SCREEN_COPY.editorErrorTitle}
        description={view.message}
        onRetry={view.onRetry}
      />
    );
  }

  if (view.kind === "idle") {
    return null;
  }

  if (view.kind === "invalidClubId") {
    return (
      <ErrorState
        title={CLUB_LOGOS_SCREEN_COPY.editorErrorTitle}
        description={CLUB_LOGOS_SCREEN_COPY.invalidClubId}
      />
    );
  }

  if (view.kind === "clubNotFound") {
    return (
      <ErrorState
        title={CLUB_LOGOS_SCREEN_COPY.editorErrorTitle}
        description={CLUB_LOGOS_SCREEN_COPY.clubNotFound}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-[88rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <ClubLogoEditorHeader accountId={accountId} clubName={view.club.name} />
      <ClubLogoWorkspace accountId={accountId} club={view.club} branding={view.branding} />
    </div>
  );
}
