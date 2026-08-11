import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { SettingsLabWorkspace } from "./_components/settings-lab-workspace";

const STATES = ["default", "saving", "loading", "error"] as const;
const MODES = ["view", "edit"] as const;

const DEMO_ACCOUNT_ID = "0000001";

function effectiveMode(mode: string): "view" | "edit" {
  return mode === "view" ? "view" : "edit";
}

export default async function RouteLabSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state, mode } = getScenario(await searchParams);
  const productionRoute = accountScopedRoutes.settings(DEMO_ACCOUNT_ID);
  const workspaceMode = effectiveMode(mode);
  const stubSaving = state === "saving";

  return (
    <RouteLabPage
      title="Settings"
      productionRoute={productionRoute}
      description="Route lab: booleans/toggles/fixtures — saves are stubbed. Production `/o/[accountId]/settings` performs real GET + PATCH via the BFF (see handoff-patch-account-settings-save)."
      contentPreset="full"
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={`state=${state}, mode=${mode}. Production pattern: ${productionRoute}`}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading settings" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState title="Could not load settings" description="Lab error — fixture only." />
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <SettingsLabWorkspace
          key={`settings-${state}-${mode}`}
          mode={workspaceMode}
          scenarioKey={state}
          stubSaving={stubSaving}
        />
      ) : null}
    </RouteLabPage>
  );
}
