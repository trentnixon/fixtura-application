import Link from "next/link";

import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyH3, TypographyMuted } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  LAB_DASHBOARD_PARTIAL,
  LAB_DASHBOARD_POPULATED,
  type LabDashboardSummary,
} from "@/features/route-lab/fixtures/dashboard";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

const MODES = ["org-selected", "no-org"] as const;
const STATES = ["empty", "populated", "partial", "loading", "error"] as const;

const DEMO_ACCOUNT_ID = "0000001";

function summariesForState(state: string): LabDashboardSummary[] | null {
  switch (state) {
    case "populated":
      return LAB_DASHBOARD_POPULATED;
    case "partial":
      return LAB_DASHBOARD_PARTIAL;
    case "empty":
      return [];
    case "loading":
    case "error":
      return null;
    default:
      return LAB_DASHBOARD_POPULATED;
  }
}

export default async function RouteLabDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state, mode } = getScenario(await searchParams);
  const summaries = summariesForState(state);
  const productionRoute = accountScopedRoutes.dashboard(DEMO_ACCOUNT_ID);

  return (
    <RouteLabPage
      title="Dashboard"
      productionRoute={productionRoute}
      description="Organisation-scoped home. Lab shell is simplified; metrics are fixtures."
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={`mode=${mode}, state=${state}. Production pattern: ${productionRoute}`}
    >
      <div className="space-y-6">
        <TypographyMuted className="text-xs">
          {mode === "no-org"
            ? "No active organisation (gateway context)."
            : "Organisation: Eastern Eagles (fixture)."}
        </TypographyMuted>

        {mode === "no-org" ? (
          <Card>
            <CardHeader>
              <TypographyH3 className="text-lg font-semibold">Select an organisation</TypographyH3>
              <TypographyMuted>
                In production, unscoped users are redirected to the gateway. This is a visual stub.
              </TypographyMuted>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="h-auto px-0 text-sm font-medium" asChild>
                <Link href={`${ROUTES.routeLab}/org/select-organisation`}>
                  Go to lab select organisation
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {mode === "org-selected" && state === "loading" ? (
          <BrandedLoader label="Loading dashboard" className="min-h-[200px]" />
        ) : null}

        {mode === "org-selected" && state === "error" ? (
          <ErrorState title="Dashboard unavailable" description="Lab error state — no API call." />
        ) : null}

        {mode === "org-selected" && state !== "loading" && state !== "error" ? (
          <>
            {summaries && summaries.length === 0 ? (
              <Card>
                <CardHeader>
                  <TypographyH3 className="text-lg font-semibold">Welcome</TypographyH3>
                  <TypographyMuted>
                    First-time empty state — create a bundle or template to get started.
                  </TypographyMuted>
                </CardHeader>
              </Card>
            ) : null}
            {summaries && summaries.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summaries.map((s) => (
                  <Card key={s.title}>
                    <CardHeader className="pb-2">
                      <TypographyMuted>{s.title}</TypographyMuted>
                      <TypographyH3 className="text-3xl font-semibold">{s.metric}</TypographyH3>
                    </CardHeader>
                    <CardContent>
                      <TypographyMuted>{s.detail}</TypographyMuted>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </RouteLabPage>
  );
}
