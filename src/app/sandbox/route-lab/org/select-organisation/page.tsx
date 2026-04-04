import { InlineAlert } from "@/components/auth/actions";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyH2, TypographyH3, TypographyMuted } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import {
  LAB_ORGANISATIONS_MULTIPLE,
  LAB_ORGANISATIONS_NONE,
  LAB_ORGANISATIONS_ONE,
  type LabOrganisation,
} from "@/features/route-lab/fixtures/organisations";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { ROUTES } from "@/lib/config/routes";

const STATES = ["loading", "none", "one", "multiple", "error"] as const;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const CREATE_ORG_HREF = `${ROUTES.routeLab}/org/create-organisation`;

function CreateOrganisationGridCard() {
  return (
    <GridCard
      variant="reverse"
      title="Create organisation"
      description="Add a new club, association, or internal workspace to the members area."
      ctaLabel="Create organisation"
      href={CREATE_ORG_HREF}
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
  const { state } = getScenario(await searchParams);
  const orgs = organisationsForState(state);

  return (
    <RouteLabPage
      title="Select organisation"
      productionRoute={ROUTES.selectOrganisation}
      description="Gateway screen for authenticated users without an active organisation scope."
      stateOptions={STATES}
      scenarioSummary={`Active query: state=${state}. Open goes to lab dashboard (not real /o/ scope).`}
    >
      {state === "loading" ? (
        <BrandedLoader fullPage label="Loading your organisations" className="min-h-[240px]" />
      ) : null}

      {state === "error" ? (
        <div className="mx-auto max-w-md py-8">
          <ErrorState
            title="Could not load accounts"
            description="Lab error state — no API was called."
          />
        </div>
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <div className="mx-auto grid w-full max-w-5xl gap-6 py-4">
          <div>
            <TypographyH2 className="font-brand text-2xl font-semibold">
              Select organisation
            </TypographyH2>
            <TypographyMuted className="mt-1">
              Choose which organisation you want to work in. You can switch later from the sidebar.
            </TypographyMuted>
          </div>

          {(state === "multiple" || state === "one") && (
            <InlineAlert
              message="You switched organisation from settings (lab banner)."
              variant="warning"
            />
          )}

          {orgs && orgs.length === 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <TypographyH3 className="text-lg font-semibold">
                    No organisations yet
                  </TypographyH3>
                  <TypographyMuted>
                    Fixture: empty list. In production, organisations would load from the CMS.
                  </TypographyMuted>
                </CardHeader>
              </Card>
              <div className="flex justify-center">
                <CreateOrganisationGridCard />
              </div>
            </div>
          ) : null}

          {orgs && orgs.length > 0 ? (
            <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CreateOrganisationGridCard />
              {orgs.map((a) => (
                <GridCard
                  key={a.id}
                  title={a.name}
                  ctaLabel="Open"
                  href={`${ROUTES.routeLab}/app/dashboard?mode=org-selected&state=populated`}
                  visual={<GridCardVisualSlot visual="org" initials={initialsFromName(a.name)} />}
                  {...(a.sport ? { description: a.sport } : {})}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </RouteLabPage>
  );
}
