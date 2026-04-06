"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { InlineAlert } from "@/components/auth/actions";
import { AccountLoadErrorFeedback } from "@/components/select-organisation/account-load-error-feedback";
import { TypographyBodySmall, TypographyPageTitle } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import {
  GridCard,
  GridCardSelectOrganisation,
  GridCardVisualSlot,
} from "@/components/ui/grid-card";
import {
  accountPickerRowsFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import {
  SELECT_ORG_REASON_QUERY,
  parseSelectOrgGatewayReason,
  selectOrgReasonMessage,
} from "@/lib/config/gateway-reasons";
import { ROUTES } from "@/lib/config/routes";
import {
  SELECT_ORG_SIM_QUERY,
  parseSelectOrgSim,
  syntheticAccountMeResponseForSim,
} from "@/lib/dev/select-organisation-sim";
import { isSelectOrgSimulatorEnabled } from "@/lib/dev-sandbox";
import { cn } from "@/lib/utils";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function CreateOrganisationGridCard({ className }: { className?: string }) {
  return (
    <GridCard
      className={cn("mx-0", className)}
      variant="reverse"
      tone="mute"
      title="Create organisation"
      description="Add a new club, association, or internal workspace to the members area."
      ctaLabel="Create organisation"
      href={ROUTES.createOrganisation}
      visual={<GridCardVisualSlot visual="add" />}
    />
  );
}

export function SelectOrganisationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orgSim = isSelectOrgSimulatorEnabled
    ? parseSelectOrgSim(searchParams.get(SELECT_ORG_SIM_QUERY))
    : null;
  const simulating = orgSim !== null;

  const { data, isPending, isError, refetch } = useAccountMe({
    enabled: !simulating,
  });

  const reasonParam = searchParams.get(SELECT_ORG_REASON_QUERY);
  const parsedReason = parseSelectOrgGatewayReason(reasonParam);

  function removeOrgSimFromUrl() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(SELECT_ORG_SIM_QUERY);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  if (orgSim === "loading") {
    return <BrandedLoader fullPage label="Loading your organisations" />;
  }

  if (!simulating && isPending) {
    return <BrandedLoader fullPage label="Loading your organisations" />;
  }

  if (orgSim === "error") {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 py-8">
        <AccountLoadErrorFeedback onRetry={removeOrgSimFromUrl} />
      </div>
    );
  }

  if (!simulating && isError) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 py-8">
        <AccountLoadErrorFeedback onRetry={() => void refetch()} />
      </div>
    );
  }

  const payload =
    orgSim === "none" || orgSim === "one" || orgSim === "multiple"
      ? syntheticAccountMeResponseForSim(orgSim).data
      : data?.data;

  const rows = accountPickerRowsFromMePayload(payload);
  const isEmpty = rows.length === 0;

  return (
    <div className="grid w-full max-w-5xl gap-6 py-4">
      <div>
        <TypographyPageTitle as="h1" className="font-brand text-2xl font-semibold sm:text-2xl">
          {isEmpty ? "Set up an organisation" : "Select organisation"}
        </TypographyPageTitle>
        <TypographyBodySmall as="p" tone="muted" className="mt-1">
          {isEmpty
            ? "Create one below."
            : "Choose which organisation you want to work in. You can switch later from the sidebar."}
        </TypographyBodySmall>
      </div>

      {parsedReason ? (
        <div className="grid gap-2">
          <InlineAlert message={selectOrgReasonMessage(parsedReason)} variant="warning" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => router.replace(ROUTES.selectOrganisation)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="flex justify-start">
          <CreateOrganisationGridCard />
        </div>
      ) : (
        <div className="flex flex-wrap items-stretch justify-start gap-4">
          <div className="flex h-full min-h-0 w-full max-w-56 shrink-0 flex-col self-stretch">
            <CreateOrganisationGridCard className="h-full min-h-0" />
          </div>
          {rows.map((a) => {
            const id = String(a.id);
            const org = organisationDetailsFromAccountRow(a);
            const name = org?.Name ?? `Account ${id}`;
            const sport = org?.Sport;
            const logo = org?.ParentLogo?.trim();
            return (
              <div
                key={id}
                className="flex h-full min-h-0 w-full max-w-56 shrink-0 flex-col self-stretch"
              >
                <GridCardSelectOrganisation
                  className="mx-0 h-full min-h-0 w-full"
                  title={name}
                  href={accountScopedRoutes.dashboard(id)}
                  {...(sport ? { sport } : {})}
                  {...(a.isActive !== undefined ? { isActive: a.isActive } : {})}
                  {...(a.isSetup !== undefined ? { isSetup: a.isSetup } : {})}
                  visual={
                    <GridCardVisualSlot
                      visual="org"
                      initials={initialsFromName(name)}
                      {...(logo ? { imageSrc: logo, imageAlt: name } : {})}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
