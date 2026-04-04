import { Undo2 } from "lucide-react";

import { InlineAlert, SubmitButton, SuccessMessageBlock } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, AuthSurfaceHeader } from "@/components/auth/structure";
import { RouteLabPage } from "@/components/dev/RouteLabPage";
import { TypographyMuted } from "@/components/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getScenario } from "@/features/route-lab/utils/getScenario";
import { ROUTES } from "@/lib/config/routes";

const STATES = ["default", "validation", "error", "submitting", "success"] as const;

export default async function RouteLabForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { state } = getScenario(await searchParams);

  return (
    <RouteLabPage
      title="Forgot password"
      productionRoute={ROUTES.forgotPassword}
      description="Password recovery request. Fixture-only; no email is sent."
      stateOptions={STATES}
      scenarioSummary={`Active query: state=${state}. Try ${STATES.join(", ")}.`}
    >
      <AuthContentContainer>
        <AuthPageSection>
          <AuthPageHeader title="Reset your password" />
          <AuthSurface className="border-brand-secondary/30">
            {state === "success" ? (
              <SuccessMessageBlock
                title="Check your inbox"
                description="Lab success state — no message was sent."
              />
            ) : (
              <>
                <AuthSurfaceHeader
                  icon={<Undo2 className="size-6" />}
                  title="Restore Access"
                  description="Verification link will be sent to your inbox."
                />
                {state === "validation" ? (
                  <InlineAlert message="Enter a valid email address." variant="destructive" />
                ) : null}
                {state === "error" ? (
                  <InlineAlert
                    message="We could not process your request. Please try again."
                    variant="destructive"
                  />
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="lab-forgot-email">Verified Email</Label>
                  <Input
                    id="lab-forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    defaultValue={state === "validation" ? "bad" : ""}
                    disabled={state === "submitting"}
                    autoComplete="off"
                  />
                  {state === "validation" ? (
                    <TypographyMuted className="text-destructive text-xs">
                      Enter a valid email address
                    </TypographyMuted>
                  ) : null}
                  <TypographyMuted className="text-xs">
                    We&apos;ll send a password reset link to this address.
                  </TypographyMuted>
                </div>
                <SubmitButton loading={state === "submitting"} type="button" buttonVariant="accent">
                  Initiate Recovery
                </SubmitButton>
                <TypographyMuted className="mt-4 text-center text-xs">
                  Lab preview — no network request.
                </TypographyMuted>
              </>
            )}
          </AuthSurface>
        </AuthPageSection>
      </AuthContentContainer>
    </RouteLabPage>
  );
}
