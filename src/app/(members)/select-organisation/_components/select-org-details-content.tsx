"use client";

import Link from "next/link";
import { useState } from "react";

import { InlineAlert } from "@/components/auth/actions";
import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyFinePrint,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { GridCardVisualSlot } from "@/components/ui/grid-card";
import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { useRetryOnboardingSetup } from "@/lib/api/hooks/account/useRetryOnboardingSetup";
import { ROUTES } from "@/lib/config/routes";

import { SelectOrgStatusBadge } from "./select-org-status-badge";
import { selectOrgPrimaryButtonVariant } from "../_utils/select-org-display-state";

import type { SelectOrganisationItemViewModel } from "../_utils/select-org-display-state";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatDate(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : null;
}

type SelectOrgDetailsContentProps = {
  item: SelectOrganisationItemViewModel;
  onPrimaryAction: () => void;
  onRetryStatus?: () => void;
  primaryPending?: boolean;
};

export function SelectOrgDetailsContent({
  item,
  onPrimaryAction,
  onRetryStatus,
  primaryPending = false,
}: SelectOrgDetailsContentProps) {
  const retryMutation = useRetryOnboardingSetup(item.accountId);
  const [retryError, setRetryError] = useState<string | null>(null);

  const created = formatDate(item.createdAt);
  const lastActivity = formatDate(item.onboardingLastActivityAt);

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <GridCardVisualSlot
          visual="org"
          className="!size-14 shrink-0"
          initials={initialsFromName(item.name)}
          {...(item.logo ? { imageSrc: item.logo, imageAlt: item.name } : {})}
          {...(item.brandColors ? { brandColors: item.brandColors } : {})}
        />
        <div className="min-w-0 space-y-1">
          <TypographyBodySmall as="p" className="text-lg font-semibold">
            {item.name}
          </TypographyBodySmall>
          {item.sport ? (
            <TypographyCaption as="p" tone="muted">
              {item.sport}
            </TypographyCaption>
          ) : null}
          <SelectOrgStatusBadge
            displayState={item.displayState}
            statusLabel={item.statusLabel}
            statusDescription={item.statusDescription}
          />
        </div>
      </div>

      <TypographyBodySmall as="p" tone="muted">
        {item.statusDescription}
      </TypographyBodySmall>

      {item.onboardingStep ? (
        <TypographyFinePrint className="text-muted-foreground">
          Onboarding step {item.onboardingStep.current} of {item.onboardingStep.total}
        </TypographyFinePrint>
      ) : null}

      {item.displayState === "needs-attention" ? (
        <InlineAlert
          message="Workspace preparation did not complete. You can retry setup or contact support if the issue continues."
          variant="destructive"
        />
      ) : null}

      <dl className="grid gap-2 text-sm">
        {item.playHqId ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">PlayHQ ID</dt>
            <dd className="font-mono text-xs">{item.playHqId}</dd>
          </div>
        ) : null}
        {created ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{created}</dd>
          </div>
        ) : null}
        {lastActivity ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Last activity</dt>
            <dd>{lastActivity}</dd>
          </div>
        ) : null}
        {item.isRightsHolder != null ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Rights holder</dt>
            <dd>{item.isRightsHolder ? "Yes" : "No"}</dd>
          </div>
        ) : null}
        {item.isPermissionGiven != null ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Permission to use content</dt>
            <dd>{item.isPermissionGiven ? "Confirmed" : "Not confirmed"}</dd>
          </div>
        ) : null}
      </dl>

      {item.brandColors ? (
        <div className="flex items-center gap-2">
          <TypographyCaption as="span" tone="muted">
            Theme
          </TypographyCaption>
          <span
            className="size-6 rounded-full border"
            style={{ backgroundColor: item.brandColors.primary }}
            aria-label="Primary theme colour"
          />
          <span
            className="size-6 rounded-full border"
            style={{ backgroundColor: item.brandColors.secondary }}
            aria-label="Secondary theme colour"
          />
        </div>
      ) : null}

      {retryError ? <InlineAlert message={retryError} variant="destructive" /> : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant={selectOrgPrimaryButtonVariant(item)}
          disabled={primaryPending}
          aria-busy={primaryPending}
          onClick={onPrimaryAction}
        >
          {primaryPending
            ? "Opening…"
            : item.displayState === "needs-attention"
              ? "Open organisation"
              : item.primaryActionLabel}
        </Button>
        {item.canRetrySetup ? (
          <Button
            type="button"
            variant="outline"
            disabled={retryMutation.isPending}
            onClick={() => {
              setRetryError(null);
              captureUserAction("onboarding_setup_retry", {
                accountId: item.accountId,
                source: "select_org_details",
              });
              retryMutation.mutate(
                {},
                {
                  onError: (e) => {
                    if (e instanceof ApiError && e.status === 409) {
                      setRetryError(
                        "Retry is not available for this account right now. Refresh the page or contact support.",
                      );
                      return;
                    }
                    setRetryError("Retry failed. Try again or contact support.");
                  },
                },
              );
            }}
          >
            {retryMutation.isPending ? "Retrying…" : "Retry setup"}
          </Button>
        ) : null}
        {item.displayState === "status-unavailable" && onRetryStatus ? (
          <Button type="button" variant="outline" onClick={onRetryStatus}>
            Retry status
          </Button>
        ) : null}
        <Button type="button" variant="ghost" asChild>
          <Link href={ROUTES.support}>Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
