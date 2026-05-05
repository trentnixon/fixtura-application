import { RouteLabPage } from "@/components/dev/RouteLabPage";
import {
  normalizeBillingLabMode,
  resolveBillingLabFixtureScenario,
} from "@/features/route-lab/billing/billing-lab-mock-client";
import {
  BILLING_LAB_MODES,
  BILLING_LAB_SCENARIO_OPTIONS,
} from "@/features/route-lab/billing/lab-billing-types";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BillingLabWorkspace } from "./_components/billing-lab-workspace";

export default async function RouteLabBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { accountId } = await params;
  const { state, mode } = getScenario(await searchParams);
  const labMode = normalizeBillingLabMode(mode);
  const fixtureScenario = resolveBillingLabFixtureScenario(state, labMode);
  const productionRoute = accountScopedRoutes.billing(accountId);

  return (
    <RouteLabPage
      title="Billing (LABS)"
      productionRoute={productionRoute}
      description="Two lab views: wizard (no subscription) and active (subscribed snapshot). Fixtures and local simulation only."
      contentPreset="full"
      stateOptions={BILLING_LAB_SCENARIO_OPTIONS}
      modeOptions={BILLING_LAB_MODES}
      scenarioSummary={`mode=${labMode}; state=${state} → fixture=${fixtureScenario}.`}
    >
      <BillingLabWorkspace
        accountId={accountId}
        labMode={labMode}
        scenarioKey={fixtureScenario}
        devStateParam={state}
      />
    </RouteLabPage>
  );
}
