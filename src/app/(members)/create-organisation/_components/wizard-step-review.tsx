"use client";

import Link from "next/link";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo } from "react";

import { InlineAlert } from "@/components/auth/actions";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client/api-error";
import {
  useAccountBranding,
  isAccountBrandingGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  useAccountOrganisationContext,
  isAccountOrganisationContextGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  useAccountSettings,
  isAccountSettingsGatewayRedirect,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useConfirmOnboarding } from "@/lib/api/hooks/account/useConfirmOnboarding";
import { useOnboardingLookupOrganisationTypes } from "@/lib/api/hooks/account/useOnboardingLookupOrganisationTypes";
import { useOnboardingLookupSports } from "@/lib/api/hooks/account/useOnboardingLookupSports";
import { useOnboardingLookupThemes } from "@/lib/api/hooks/account/useOnboardingLookupThemes";
import { useCurrentUser } from "@/lib/api/hooks/auth/useCurrentUser";
import { themeColoursForReviewStep } from "@/lib/branding/theme-colours-from-account";
import { ROUTES } from "@/lib/config/routes";

import { OnboardingSection } from "./onboarding-section";

function errorMessageFromUnknown(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      const d = e.details;
      if (typeof d === "object" && d !== null && "error" in d) {
        const err = (d as { error?: { message?: string } }).error;
        if (typeof err?.message === "string" && err.message.trim()) return err.message;
      }
      return "This account state does not allow completing the wizard yet. Refresh or go back to organisation selection.";
    }
    const d = e.details;
    if (typeof d === "object" && d !== null && "error" in d) {
      const err = (d as { error?: { message?: string } }).error;
      if (typeof err?.message === "string" && err.message.trim()) return err.message;
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong. Try again.";
}

export type WizardStepReviewHandle = {
  submit: () => Promise<void>;
};

type WizardStepReviewProps = {
  accountId: string;
  /** After successful W4; disables repeat confirm. */
  confirmed?: boolean;
  onPendingChange?: (pending: boolean) => void;
  onConfirmSuccess?: () => void | Promise<void>;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4">
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="text-sm wrap-break-word">{value || "—"}</dd>
    </div>
  );
}

export const WizardStepReview = forwardRef<WizardStepReviewHandle, WizardStepReviewProps>(
  function WizardStepReview(
    { accountId, confirmed = false, onPendingChange, onConfirmSuccess },
    ref,
  ) {
    const settingsQuery = useAccountSettings(accountId, { enabled: Boolean(accountId) });
    const orgQuery = useAccountOrganisationContext(accountId, { enabled: Boolean(accountId) });
    const brandingQuery = useAccountBranding(accountId, { enabled: Boolean(accountId) });
    const meQuery = useAccountMe();
    const authUserQuery = useCurrentUser();
    const sportsQuery = useOnboardingLookupSports();
    const orgTypesQuery = useOnboardingLookupOrganisationTypes();
    const themesQuery = useOnboardingLookupThemes();
    const confirmMutation = useConfirmOnboarding(accountId);

    const orgSectionId = useId();
    const brandSectionId = useId();
    const contactSectionId = useId();

    const settingsGateway =
      settingsQuery.data && isAccountSettingsGatewayRedirect(settingsQuery.data)
        ? settingsQuery.data
        : null;
    const orgGateway =
      orgQuery.data && isAccountOrganisationContextGatewayRedirect(orgQuery.data)
        ? orgQuery.data
        : null;
    const brandingGateway =
      brandingQuery.data && isAccountBrandingGatewayRedirect(brandingQuery.data)
        ? brandingQuery.data
        : null;

    const settingsPayload = useMemo(() => {
      const q = settingsQuery.data;
      if (!q || isAccountSettingsGatewayRedirect(q)) return undefined;
      return q.data;
    }, [settingsQuery.data]);

    const orgPayload = useMemo(() => {
      const q = orgQuery.data;
      if (!q || isAccountOrganisationContextGatewayRedirect(q)) return undefined;
      return q.data;
    }, [orgQuery.data]);

    const brandingPayload = useMemo(() => {
      const q = brandingQuery.data;
      if (!q || isAccountBrandingGatewayRedirect(q)) return undefined;
      return q.data;
    }, [brandingQuery.data]);

    const sports = useMemo(() => sportsQuery.data?.data ?? [], [sportsQuery.data]);
    const orgTypes = useMemo(() => orgTypesQuery.data?.data ?? [], [orgTypesQuery.data]);

    const sportLabel = useMemo(() => {
      const id = settingsPayload?.Sport?.trim() ?? "";
      if (!id) return "";
      return sports.find((s) => s.id === id)?.label ?? id;
    }, [settingsPayload?.Sport, sports]);

    const reviewThemeColours = useMemo(() => {
      return themeColoursForReviewStep(brandingPayload?.theme ?? null, themesQuery.data?.data);
    }, [brandingPayload?.theme, themesQuery.data?.data]);

    const orgTypeLabel = useMemo(() => {
      const tid = settingsPayload?.account_type;
      if (tid == null) return "";
      return orgTypes.find((t) => t.id === tid)?.label ?? String(tid);
    }, [settingsPayload?.account_type, orgTypes]);

    const organisationDisplayName = useMemo(() => {
      const fromOrg = orgPayload?.accountOrganisationDetails?.Name?.trim();
      if (fromOrg) return fromOrg;
      const fromSettings = settingsPayload?.onboardingOrganisationName?.trim();
      return fromSettings ?? "";
    }, [orgPayload?.accountOrganisationDetails?.Name, settingsPayload?.onboardingOrganisationName]);

    const primaryEmail = authUserQuery.data?.user.email?.trim() ?? "";

    const loading =
      (settingsQuery.isPending && !settingsQuery.data) ||
      (orgQuery.isPending && !orgQuery.data) ||
      (brandingQuery.isPending && !brandingQuery.data) ||
      (meQuery.isPending && !meQuery.data);

    const sectionErrors = useMemo(() => {
      const e: { key: string; label: string }[] = [];
      if (settingsQuery.isError) e.push({ key: "settings", label: "Account settings" });
      if (orgQuery.isError) e.push({ key: "organisation", label: "Organisation" });
      if (brandingQuery.isError) e.push({ key: "branding", label: "Branding" });
      if (meQuery.isError) e.push({ key: "accountMe", label: "Account summary" });
      return e;
    }, [settingsQuery.isError, orgQuery.isError, brandingQuery.isError, meQuery.isError]);

    const hasPartialFailure = sectionErrors.length > 0;
    const hasGateway = Boolean(settingsGateway || orgGateway || brandingGateway);

    useEffect(() => {
      const lookupsLoading =
        sportsQuery.isPending || orgTypesQuery.isPending || themesQuery.isPending;
      onPendingChange?.(confirmMutation.isPending || loading || lookupsLoading);
    }, [
      confirmMutation.isPending,
      loading,
      onPendingChange,
      sportsQuery.isPending,
      orgTypesQuery.isPending,
      themesQuery.isPending,
    ]);

    const submit = useCallback(async () => {
      if (confirmed || hasGateway || !settingsPayload) return;
      try {
        await confirmMutation.mutateAsync({});
        await onConfirmSuccess?.();
      } catch {
        /* surfaced via confirmMutation */
      }
    }, [confirmed, hasGateway, settingsPayload, confirmMutation, onConfirmSuccess]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    if (settingsGateway || orgGateway || brandingGateway) {
      return (
        <div className="flex flex-col gap-4">
          <InlineAlert
            message="We could not load account data for this step. Return to organisation selection and try again."
            variant="destructive"
          />
          <Link
            href={ROUTES.selectOrganisation}
            className="text-primary text-sm font-medium underline underline-offset-4"
          >
            Back to organisation selection
          </Link>
        </div>
      );
    }

    if (loading) {
      return (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Loading your summary…
        </p>
      );
    }

    if (confirmed) {
      return (
        <div className="flex flex-col gap-3">
          <InlineAlert message="Wizard complete." variant="success" />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {confirmMutation.isError ? (
          <InlineAlert
            message={errorMessageFromUnknown(confirmMutation.error)}
            variant="destructive"
          />
        ) : null}

        {hasPartialFailure ? (
          <div className="flex flex-col gap-2">
            <InlineAlert
              message="Some sections could not be loaded. Refresh the page or retry. You can still try to finish if the minimum data is present."
              variant="destructive"
            />
            <ul className="text-muted-foreground list-inside list-disc text-xs">
              {sectionErrors.map((s) => (
                <li key={s.key}>{s.label}</li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                void settingsQuery.refetch();
                void orgQuery.refetch();
                void brandingQuery.refetch();
                void meQuery.refetch();
              }}
            >
              Retry all
            </Button>
          </div>
        ) : null}

        {authUserQuery.isError ? (
          <InlineAlert
            message="We could not load your sign-in email. Other details below are still shown."
            variant="info"
          />
        ) : null}

        <OnboardingSection title="Organisation" titleId={orgSectionId}>
          <dl className="flex flex-col gap-2">
            <SummaryRow label="Name" value={organisationDisplayName} />
            <SummaryRow label="Sport" value={sportLabel} />
            <SummaryRow label="Organisation type" value={orgTypeLabel} />
            <SummaryRow
              label="Authorised to act"
              value={settingsPayload?.isRightsHolder === true ? "Yes" : "No"}
            />
            <SummaryRow
              label="Permission to fetch data"
              value={settingsPayload?.isPermissionGiven === true ? "Yes" : "No"}
            />
          </dl>
        </OnboardingSection>

        <OnboardingSection title="Branding" titleId={brandSectionId}>
          {brandingQuery.isError ? (
            <p className="text-muted-foreground text-sm">Could not load branding.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground text-xs">Primary</span>
                <span
                  className="inline-block h-8 w-10 rounded border"
                  style={{
                    backgroundColor: reviewThemeColours.primary,
                  }}
                  title={reviewThemeColours.primary}
                />
                <span className="text-muted-foreground text-xs">Secondary</span>
                <span
                  className="inline-block h-8 w-10 rounded border"
                  style={{
                    backgroundColor: reviewThemeColours.secondary,
                  }}
                  title={reviewThemeColours.secondary}
                />
              </div>
              {brandingPayload?.onboardingLogo?.url ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Logo</span>
                  <img
                    src={brandingPayload.onboardingLogo.url}
                    alt="Organisation logo"
                    className="h-12 w-auto max-w-[140px] rounded border object-contain"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No logo on file.</p>
              )}
            </div>
          )}
        </OnboardingSection>

        <OnboardingSection title="Contact and delivery" titleId={contactSectionId}>
          {settingsQuery.isError ? (
            <p className="text-muted-foreground text-sm">Could not load contact fields.</p>
          ) : (
            <dl className="flex flex-col gap-2">
              <SummaryRow label="Email (sign-in)" value={primaryEmail} />
              <SummaryRow label="First name" value={settingsPayload?.FirstName?.trim() ?? ""} />
              <SummaryRow label="Last name" value={settingsPayload?.LastName?.trim() ?? ""} />
              <SummaryRow
                label="Weekly assets email"
                value={settingsPayload?.DeliveryAddress?.trim() ?? ""}
              />
            </dl>
          )}
        </OnboardingSection>
      </div>
    );
  },
);
