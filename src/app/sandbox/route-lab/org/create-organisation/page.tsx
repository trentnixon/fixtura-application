import Link from "next/link";

import { InlineAlert, SubmitButton } from "@/components/auth/actions";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { ROUTES } from "@/lib/config/routes";

const STATES = ["default", "validation", "submitting", "success"] as const;

export default async function RouteLabCreateOrganisationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state } = getScenario(await searchParams);

  return (
    <RouteLabPage
      title="Create organisation"
      productionRoute={ROUTES.createOrganisation}
      description="Onboarding-style form scaffold. Fixture-only; nothing is persisted."
      contentPreset="form"
      stateOptions={STATES}
      scenarioSummary={`Active query: state=${state}. Try ${STATES.join(", ")}.`}
    >
      <div className="grid gap-6">
        {state === "success" ? (
          <Card>
            <CardHeader>
              <TypographyH3 className="text-lg font-semibold">Organisation created</TypographyH3>
              <TypographyMuted>
                Lab success — next step would be select dashboard or invite teammates.
              </TypographyMuted>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`${ROUTES.routeLab}/org/select-organisation?state=multiple`}>
                  Continue to selection
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <TypographyH3 className="text-lg font-semibold">Create organisation</TypographyH3>
              <TypographyMuted>
                Representative fields for lab layout. Replace with CMS contract when available.
              </TypographyMuted>
            </CardHeader>
            <CardContent className="grid gap-4">
              {state === "validation" ? (
                <InlineAlert message="Fix the highlighted fields." variant="destructive" />
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="lab-org-name">Organisation name</Label>
                <Input
                  id="lab-org-name"
                  defaultValue={state === "validation" ? "" : "My club"}
                  disabled={state === "submitting"}
                  placeholder="e.g. Riverside AFC"
                />
                {state === "validation" ? (
                  <TypographyMuted className="text-destructive text-xs">
                    Enter an organisation name
                  </TypographyMuted>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab-org-sport">Primary sport (optional)</Label>
                <Input
                  id="lab-org-sport"
                  placeholder="e.g. Netball"
                  disabled={state === "submitting"}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <SubmitButton loading={state === "submitting"} type="button">
                Create organisation
              </SubmitButton>
              <Button variant="outline" asChild>
                <Link href={`${ROUTES.routeLab}/org/select-organisation`}>Cancel</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </RouteLabPage>
  );
}
