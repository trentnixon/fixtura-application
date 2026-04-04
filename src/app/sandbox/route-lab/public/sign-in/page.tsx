import Link from "next/link";

import { InlineAlert, SubmitButton } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface } from "@/components/auth/structure";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyMuted } from "@/components/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { ROUTES } from "@/lib/config/routes";

const STATES = ["default", "validation", "error", "submitting"] as const;

export default async function RouteLabSignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state } = getScenario(await searchParams);

  return (
    <RouteLabPage
      title="Sign in"
      productionRoute={ROUTES.signIn}
      description="Members sign-in screen. Fixture-only scenarios; no credentials are checked."
      stateOptions={STATES}
      scenarioSummary={`Active query: state=${state}. Try ${STATES.join(", ")}.`}
    >
      <AuthContentContainer>
        <AuthPageSection>
          <AuthPageHeader title="Sign in" />
          <AuthSurface>
            {state === "validation" ? (
              <InlineAlert message="Fix the fields below before continuing." variant="warning" />
            ) : null}
            {state === "error" ? (
              <InlineAlert
                message="We could not sign you in. Check your details or try again later."
                variant="destructive"
              />
            ) : null}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lab-signin-email">Email</Label>
                <Input
                  id="lab-signin-email"
                  type="email"
                  defaultValue={state === "validation" ? "not-an-email" : ""}
                  disabled={state === "submitting"}
                  autoComplete="off"
                />
                {state === "validation" ? (
                  <TypographyMuted className="text-destructive text-xs">
                    Enter a valid email address
                  </TypographyMuted>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-2">
                  <Label htmlFor="lab-signin-password">Password</Label>
                  <Link
                    href={`${ROUTES.routeLab}/public/forgot-password`}
                    className="text-primary text-[10px] font-bold tracking-widest uppercase hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="lab-signin-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={state === "submitting"}
                  autoComplete="off"
                />
                {state === "validation" ? (
                  <TypographyMuted className="text-destructive text-xs">
                    Enter your password
                  </TypographyMuted>
                ) : null}
              </div>
            </div>
            <SubmitButton loading={state === "submitting"} type="button">
              Sign in
            </SubmitButton>
            <TypographyMuted className="mt-4 text-center text-xs">
              Lab preview — no network request; button is inert.
            </TypographyMuted>
          </AuthSurface>
        </AuthPageSection>
      </AuthContentContainer>
    </RouteLabPage>
  );
}
