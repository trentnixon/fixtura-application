import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { NotificationsLabWorkspace } from "./_components/notifications-lab-workspace";

const STATES = ["default", "saving", "loading", "error", "setup-pending", "inactive"] as const;
const MODES = ["view", "edit"] as const;

const DEMO_ACCOUNT_ID = "0000001";

function effectiveMode(mode: string): "view" | "edit" {
  return mode === "view" ? "view" : "edit";
}

export default async function RouteLabNotificationsPage({
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
      title="Notifications"
      productionRoute={productionRoute}
      description="Route lab: bundle delivery & notification preferences — fixture only. Production may align with `/o/[accountId]/settings` or a future notifications route."
      contentPreset="full"
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={`state=${state}, mode=${mode}. Related production pattern: ${productionRoute}`}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading notifications" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState
          title="Could not load notification preferences"
          description="Lab error — fixture only."
        />
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <NotificationsLabWorkspace
          key={`notifications-${state}-${mode}`}
          mode={workspaceMode}
          scenarioKey={state}
          stubSaving={stubSaving}
        />
      ) : null}
    </RouteLabPage>
  );
}
