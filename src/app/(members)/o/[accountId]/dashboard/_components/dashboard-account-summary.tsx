import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { SectionBlock, SectionLabel } from "@/components/ui/section";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import type { DashboardViewModel } from "../dashboard-view-model";
import type { ReactNode } from "react";

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <SectionLabel>{title}</SectionLabel>
      {description ? <TypographyMuted className="text-xs">{description}</TypographyMuted> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <TypographyMuted className="shrink-0 text-xs font-medium tracking-tight uppercase">
        {label}
      </TypographyMuted>
      <div className="min-w-0 text-right text-sm sm:text-left">{value}</div>
    </div>
  );
}

type DashboardAccountSummaryProps = {
  model: Pick<DashboardViewModel, "orgDetails" | "settings" | "userEmail" | "accountType">;
  settingsPending: boolean;
  orgPending: boolean;
};

export function DashboardAccountSummary({
  model,
  settingsPending,
  orgPending,
}: DashboardAccountSummaryProps) {
  if (orgPending && !model.orgDetails) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  const { orgDetails, settings, userEmail, accountType } = model;

  return (
    <div className="grid gap-4">
      <SectionBlock variant="surface" spacing="md">
        <SectionHeading title="Organisation" description="From organisation context" />
        <div className="grid gap-3">
          <Row label="Name" value={orgDetails?.Name ?? "—"} />
          <Separator />
          <Row label="Sport" value={orgDetails?.Sport ?? "—"} />
          <Separator />
          <Row label="Account type" value={accountType != null ? String(accountType) : "—"} />
          {orgDetails?.PlayHQID ? (
            <>
              <Separator />
              <Row label="PlayHQ ID" value={orgDetails.PlayHQID} />
            </>
          ) : null}
          {orgDetails?.href ? (
            <>
              <Separator />
              <Row
                label="External"
                value={
                  <a
                    href={orgDetails.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open link
                  </a>
                }
              />
            </>
          ) : null}
        </div>
      </SectionBlock>

      <SectionBlock variant="inset" spacing="md">
        <SectionHeading title="Account" description="Status and contact" />
        {settingsPending && !settings ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : settings ? (
          <div className="grid gap-3">
            <Row
              label="Rights holder"
              value={
                <Badge variant={settings.isRightsHolder ? "default" : "secondary"}>
                  {boolLabel(settings.isRightsHolder)}
                </Badge>
              }
            />
            <Separator />
            <Row label="Start sequence" value={boolLabel(settings.hasCompletedStartSequence)} />
            <Separator />
            <Row label="Custom template" value={boolLabel(settings.hasCustomTemplate)} />
            <Separator />
            <Row
              label="Contact"
              value={
                [settings.FirstName, settings.LastName].filter(Boolean).join(" ").trim() || "—"
              }
            />
            <Separator />
            <Row label="Delivery" value={settings.DeliveryAddress?.trim() || "—"} />
            <Separator />
            <Row
              label="Group assets"
              value={
                <Badge variant={settings.group_assets_by ? "default" : "outline"}>
                  {boolLabel(settings.group_assets_by)}
                </Badge>
              }
            />
            <Separator />
            <Row
              label="Junior surnames"
              value={
                <Badge variant={settings.include_junior_surnames ? "default" : "outline"}>
                  {boolLabel(settings.include_junior_surnames)}
                </Badge>
              }
            />
            {settings.onboardingOrganisationName ? (
              <>
                <Separator />
                <Row label="Onboarding name" value={settings.onboardingOrganisationName} />
              </>
            ) : null}
          </div>
        ) : (
          <TypographyMuted className="text-sm">No settings loaded.</TypographyMuted>
        )}
      </SectionBlock>

      {userEmail ? (
        <SectionBlock variant="plain" spacing="sm">
          <SectionHeading title="Signed in" />
          <TypographyMuted className="text-sm">{userEmail}</TypographyMuted>
        </SectionBlock>
      ) : null}
    </div>
  );
}

function boolLabel(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}
