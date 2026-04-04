import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyH3, TypographyMuted } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { accountScopedRoutes } from "@/lib/config/account-routes";

const STATES = ["default", "loading", "error"] as const;

const DEMO_ACCOUNT_ID = "0000001";

export default async function RouteLabSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state } = getScenario(await searchParams);
  const productionRoute = accountScopedRoutes.settings(DEMO_ACCOUNT_ID);

  return (
    <RouteLabPage
      title="Settings"
      productionRoute={productionRoute}
      description="Organisation settings layout stub. Fields are inert."
      contentPreset="full"
      stateOptions={STATES}
      scenarioSummary={`Active query: state=${state}. Production pattern: ${productionRoute}`}
    >
      {state === "loading" ? (
        <BrandedLoader label="Loading settings" className="min-h-[200px]" />
      ) : null}

      {state === "error" ? (
        <ErrorState title="Could not load settings" description="Lab error — fixture only." />
      ) : null}

      {state === "default" ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <TypographyH3 className="text-lg font-semibold">Organisation profile</TypographyH3>
              <TypographyMuted>Visible name and sport shown across the app.</TypographyMuted>
            </CardHeader>
            <CardContent className="grid max-w-md gap-4">
              <div className="space-y-2">
                <Label htmlFor="lab-settings-name">Display name</Label>
                <Input id="lab-settings-name" defaultValue="Eastern Eagles" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab-settings-sport">Sport</Label>
                <Input id="lab-settings-sport" defaultValue="AFL" readOnly />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <TypographyH3 className="text-lg font-semibold">Notifications</TypographyH3>
              <TypographyMuted>Lab placeholder section.</TypographyMuted>
            </CardHeader>
            <CardContent>
              <TypographyMuted>No options wired in the lab.</TypographyMuted>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </RouteLabPage>
  );
}
