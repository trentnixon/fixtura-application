import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { AccountLabWorkspace } from "./_components/account-lab-workspace";

const STATES = ["default", "saving", "loading", "error", "setup-pending", "inactive"] as const;
const MODES = ["view", "edit"] as const;

const DEMO_ACCOUNT_ID = "0000001";

function effectiveMode(mode: string): "view" | "edit" {
  return mode === "view" ? "view" : "edit";
}

export default async function RouteLabAccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state, mode } = getScenario(await searchParams);
  const productionRoute = accountScopedRoutes.account(DEMO_ACCOUNT_ID);
  const workspaceMode = effectiveMode(mode);
  const stubSaving = state === "saving";

  return (
    <RouteLabPage
      title="Account"
      productionRoute={productionRoute}
      description="Route lab: account and organisation profile — fixture only, no CMS or API persistence. Bundle delivery lives on the Notifications lab. Production `/o/[accountId]/account` will align after promotion."
      contentPreset="full"
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={`state=${state}, mode=${mode}. Production pattern: ${productionRoute}`}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading account" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState title="Could not load account" description="Lab error — fixture only." />
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <AccountLabWorkspace
          key={`account-${state}-${mode}`}
          mode={workspaceMode}
          scenarioKey={state}
          stubSaving={stubSaving}
        />
      ) : null}
    </RouteLabPage>
  );
}
