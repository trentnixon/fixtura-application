import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import { logoUploaderScenarioForLabState } from "@/features/route-lab/fixtures/logo-uploader";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { LogoUploaderLabWorkspace } from "./_components/logo-uploader-lab-workspace";

const STATES = [
  "default",
  "empty",
  "uploaded",
  "validation",
  "recrop",
  "recrop-no-source",
  "loading",
  "error",
  "saving",
] as const;

const MODES = ["view", "edit"] as const;

function effectiveMode(mode: string): "view" | "edit" {
  return mode === "view" ? "view" : "edit";
}

export default async function RouteLabLogoUploaderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state, mode } = getScenario(await searchParams);
  const productionRoute = accountScopedRoutes.brandLogo("575");
  const scenarioSummary = `state=${state}, mode=${mode}. Production: ${productionRoute}`;
  const workspaceMode = effectiveMode(mode);
  const scenario = logoUploaderScenarioForLabState(state);
  const seedUploadedPreview = state === "uploaded";
  const stubSaving = state === "saving";
  const validationScenario = state === "validation";

  return (
    <RouteLabPage
      title="Logo uploader"
      productionRoute={productionRoute}
      description="Route lab: crop and preview an organisation logo. Saves are stubbed here — no upload or server update runs."
      contentPreset="full"
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={scenarioSummary}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading logo" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState title="Could not load logo" description="Lab error state — no API call." />
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <LogoUploaderLabWorkspace
          key={`logo-uploader-${state}-${mode}`}
          data={scenario.branding}
          mode={workspaceMode}
          scenarioKey={state}
          seedUploadedPreview={seedUploadedPreview}
          stubSaving={stubSaving}
          validationScenario={validationScenario}
          editableLogoSourceUrl={scenario.editableLogoSourceUrl ?? null}
        />
      ) : null}
    </RouteLabPage>
  );
}
