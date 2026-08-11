import Link from "next/link";

import { CreateOrganisationCard } from "@/app/(members)/select-organisation/_components/create-organisation-card";
import { SelectOrgGridItem } from "@/app/(members)/select-organisation/_components/select-org-collection-items";
import { SelectOrgLoadingSkeleton } from "@/app/(members)/select-organisation/_components/select-org-loading-skeleton";
import { buildSelectOrgItemViewModel } from "@/app/(members)/select-organisation/_utils/build-select-org-item-view-model";
import { InlineAlert } from "@/components/auth/actions";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { AccountLoadErrorFeedbackLab } from "@/components/select-organisation/account-load-error-feedback";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
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

import type { AccountSummary } from "@/types/api/account";

const STATES = [
  "loading",
  "loading-skeleton",
  "none",
  "one",
  "multiple",
  "last-used",
  "error",
] as const;

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

function labRowFromOrganisation(a: LabOrganisation) {
  return {
    id: Number.parseInt(a.id.replace(/\D/g, ""), 10) || 1,
    onboardingWizardCompletedAt: a.isSetup === false ? null : "2026-01-01T00:00:00.000Z",
    isSetup: a.isSetup ?? true,
    isActive: a.isActive ?? true,
    isUpdating: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    FirstName: null,
    LastName: null,
    DeliveryAddress: null,
    isRightsHolder: null,
    isPermissionGiven: null,
    group_assets_by: false,
    include_junior_surnames: false,
    Sport: a.sport ?? null,
    onboardingOrganisationName: a.name,
    theme: null,
    accountOrganisationDetails: {
      id: Number.parseInt(a.id.replace(/\D/g, ""), 10) || 1,
      Name: a.name,
      href: "",
      ParentLogo: a.logo ?? "",
      Sport: a.sport ?? null,
    },
  } as AccountSummary;
}

function CreateOrganisationGridCard({ className }: { className?: string }) {
  return <CreateOrganisationCard variant="grid" {...(className ? { className } : {})} />;
}

function organisationsForState(state: string): LabOrganisation[] | null {
  switch (state) {
    case "none":
      return LAB_ORGANISATIONS_NONE;
    case "one":
      return LAB_ORGANISATIONS_ONE;
    case "multiple":
    case "last-used":
      return LAB_ORGANISATIONS_MULTIPLE;
    case "loading":
    case "loading-skeleton":
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
      {state === "loading-skeleton" ? <SelectOrgLoadingSkeleton /> : null}

      {state === "error" ? (
        <div className="flex w-full max-w-md flex-col gap-4 py-8">
          <AccountLoadErrorFeedbackLab />
        </div>
      ) : null}

      {state !== "loading" && state !== "loading-skeleton" && state !== "error" ? (
        <div className="grid w-full max-w-7xl gap-6 py-4 2xl:max-w-[90rem]">
          <div>
            <TypographyH2 className="font-brand text-2xl font-semibold">
              {orgs && orgs.length === 0 ? "Set up an organisation" : "Select organisation"}
            </TypographyH2>
            <TypographyMuted className="mt-1">
              {orgs && orgs.length === 0
                ? "Create one below."
                : "Choose a workspace to continue. You can switch later."}
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

          {orgs && orgs.length === 0 ? <CreateOrganisationCard variant="empty" /> : null}

          {orgs && orgs.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
              {orgs.map((a) => {
                const item = buildSelectOrgItemViewModel({
                  row: labRowFromOrganisation(a),
                  lifecycleQueryStatus: "success",
                  simulating: true,
                  isLastUsed: state === "last-used" && a.id === "lab-2",
                });
                return (
                  <SelectOrgGridItem
                    key={a.id}
                    item={item}
                    busy={false}
                    pending={false}
                    onPrimaryAction={() => undefined}
                    onStatusInfo={() => undefined}
                  />
                );
              })}
              <CreateOrganisationGridCard />
            </div>
          ) : null}
        </div>
      ) : null}
    </RouteLabPage>
  );
}
