import Link from "next/link";

import { InlineAlert } from "@/components/auth/actions";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { AccountLoadErrorFeedbackLab } from "@/components/select-organisation/account-load-error-feedback";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import {
  GridCard,
  GridCardSelectOrganisation,
  GridCardVisualSlot,
} from "@/components/ui/grid-card";
import {
  LAB_ORGANISATIONS_MULTIPLE,
  LAB_ORGANISATIONS_NONE,
  LAB_ORGANISATIONS_ONE,
  type LabOrganisation,
} from "@/features/route-lab/fixtures/organisations";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import {
  SELECT_ORG_REASON_QUERY,
  parseSelectOrgGatewayReason,
  selectOrgReasonMessage,
} from "@/lib/config/gateway-reasons";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

const STATES = ["loading", "none", "one", "multiple", "error"] as const;

const LAB_SELECT_ORG_PATH = `${ROUTES.routeLab}/org/select-organisation`;

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function labDismissReasonHref(
  params: Record<string, string | string[] | undefined>,
  pathname: string,
): string {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (key === SELECT_ORG_REASON_QUERY) continue;
    if (val === undefined) continue;
    const v = Array.isArray(val) ? val[0] : val;
    if (v) sp.set(key, v);
  }
  const q = sp.toString();
  return q ? `${pathname}?${q}` : pathname;
}

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
      href={`${ROUTES.routeLab}/org/create-organisation`}
      visual={<GridCardVisualSlot visual="add" />}
    />
  );
}

function organisationsForState(state: string): LabOrganisation[] | null {
  switch (state) {
    case "none":
      return LAB_ORGANISATIONS_NONE;
    case "one":
      return LAB_ORGANISATIONS_ONE;
    case "multiple":
      return LAB_ORGANISATIONS_MULTIPLE;
    case "loading":
    case "error":
      return null;
    default:
      return LAB_ORGANISATIONS_MULTIPLE;
  }
}

export default async function RouteLabSelectOrganisationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const { state } = getScenario(resolvedParams);
  const orgs = organisationsForState(state);

  const reasonParam = firstQueryValue(resolvedParams[SELECT_ORG_REASON_QUERY]);
  const parsedReason = parseSelectOrgGatewayReason(reasonParam ?? null);
  const dismissHref = labDismissReasonHref(resolvedParams, LAB_SELECT_ORG_PATH);

  const scenarioSummary = `Active query: state=${state}. Append ?${SELECT_ORG_REASON_QUERY}=forbidden|not_found|invalid_org (with state) to mirror production gateway messaging; Dismiss clears the reason and keeps other params. Open uses the lab dashboard (not real /o/ scope).`;

  return (
    <RouteLabPage
      title="Select organisation"
      productionRoute={ROUTES.selectOrganisation}
      description="Gateway screen for authenticated users without an active organisation scope."
      stateOptions={STATES}
      scenarioSummary={scenarioSummary}
    >
      {state === "loading" ? <BrandedLoader fullPage label="Loading your organisations" /> : null}

      {state === "error" ? (
        <div className="flex w-full max-w-md flex-col gap-4 py-8">
          <AccountLoadErrorFeedbackLab />
        </div>
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <div className="grid w-full max-w-5xl gap-6 py-4">
          <div>
            <TypographyH2 className="font-brand text-2xl font-semibold">
              {orgs && orgs.length === 0 ? "Set up an organisation" : "Select organisation"}
            </TypographyH2>
            <TypographyMuted className="mt-1">
              {orgs && orgs.length === 0
                ? "Create one below."
                : "Choose which organisation you want to work in. You can switch later from the sidebar."}
            </TypographyMuted>
          </div>

          {parsedReason ? (
            <div className="grid gap-2">
              <InlineAlert message={selectOrgReasonMessage(parsedReason)} variant="warning" />
              <Button asChild variant="ghost" size="sm" className="self-start">
                <Link href={dismissHref}>Dismiss</Link>
              </Button>
            </div>
          ) : null}

          {orgs && orgs.length === 0 ? (
            <div className="flex justify-start">
              <CreateOrganisationGridCard />
            </div>
          ) : null}

          {orgs && orgs.length > 0 ? (
            <div className="flex flex-wrap items-stretch justify-start gap-4">
              <div className="flex h-full min-h-0 w-full max-w-56 shrink-0 flex-col self-stretch">
                <CreateOrganisationGridCard className="h-full min-h-0" />
              </div>
              {orgs.map((a) => {
                const name = a.name;
                const sport = a.sport;
                const logo = a.logo?.trim();
                return (
                  <div
                    key={a.id}
                    className="flex h-full min-h-0 w-full max-w-56 shrink-0 flex-col self-stretch"
                  >
                    <GridCardSelectOrganisation
                      className="mx-0 h-full min-h-0 w-full"
                      title={name}
                      href={`${ROUTES.routeLab}/app/dashboard?mode=org-selected&state=populated`}
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
          ) : null}
        </div>
      ) : null}
    </RouteLabPage>
  );
}
