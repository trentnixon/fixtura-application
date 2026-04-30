import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/ui/error-state";
import {
  LAB_BRANDING_EMPTY,
  LAB_BRANDING_LEGACY_THEME,
  LAB_BRANDING_MEDIA_REQUIRED,
  LAB_BRANDING_READY,
} from "@/features/route-lab/fixtures/branding";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BrandingLabWorkspace } from "./_components/branding-lab-workspace";

import type { AccountBrandingData } from "@/types/api/account";

const STATES = ["default", "loading", "error", "empty", "legacy-theme", "media-required"] as const;

const MODES = ["default", "view", "edit"] as const;

function fixtureForState(state: string): AccountBrandingData {
  switch (state) {
    case "empty":
      return LAB_BRANDING_EMPTY;
    case "legacy-theme":
      return LAB_BRANDING_LEGACY_THEME;
    case "media-required":
      return LAB_BRANDING_MEDIA_REQUIRED;
    case "loading":
    case "error":
      return LAB_BRANDING_READY;
    default:
      return LAB_BRANDING_READY;
  }
}

function effectiveMode(mode: string): "view" | "edit" {
  return mode === "view" ? "view" : "edit";
}

export default async function RouteLabBrandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state, mode } = getScenario(await searchParams);
  const productionRoute = accountScopedRoutes.branding("575");
  const scenarioSummary = `state=${state}, mode=${mode}. Production: ${productionRoute}`;
  const workspaceMode = effectiveMode(mode);
  const data = fixtureForState(state);

  return (
    <RouteLabPage
      title="Branding"
      productionRoute={productionRoute}
      description="Organisation branding workspace for theme colours, template preview, and saved CMS selections."
      contentPreset="full"
      stateOptions={STATES}
      modeOptions={MODES}
      scenarioSummary={scenarioSummary}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading branding" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState title="Could not load branding" description="Lab error state — no API call." />
      ) : null}

      {state !== "loading" && state !== "error" ? (
        <BrandingLabWorkspace
          key={`branding-${state}`}
          accountId="575"
          data={data}
          includeBrandingPageIntro={false}
          mode={workspaceMode}
        />
      ) : null}
    </RouteLabPage>
  );
}
