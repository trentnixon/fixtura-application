"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { isAccountOrganisationContextGatewayRedirect } from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { isAccountSettingsGatewayRedirect } from "@/lib/api/hooks/account/useAccountSettings";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { AccountOverviewSection } from "./AccountOverviewSection";
import { AccountSignInSecuritySection } from "./AccountSignInSecuritySection";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { EditDisplayNameDialog } from "./EditDisplayNameDialog";
import { EditLoginEmailDialog } from "./EditLoginEmailDialog";
import { useAccountSecurityContentState } from "../_hooks/useAccountSecurityContentState";
import { buildAccountSecuritySummary } from "../_utils/account-security-display";

import type { AccountSecurityContentProps } from "../_types/account-security";

function RedirectingState() {
  return (
    <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
      <p>Redirecting...</p>
    </div>
  );
}

export function AccountSecurityContent({ accountId }: AccountSecurityContentProps) {
  const {
    emailDialog,
    meQ,
    orgContextSlice,
    orgQ,
    passwordDialog,
    profileDialog,
    segmentOk,
    settingsQ,
  } = useAccountSecurityContentState({ accountId });

  if (!segmentOk) {
    return <RedirectingState />;
  }

  if (settingsQ.isPending || meQ.isPending || orgQ.isPending) {
    return <BrandedLoader label="Loading account" />;
  }

  if (settingsQ.isSuccess && settingsQ.data && isAccountSettingsGatewayRedirect(settingsQ.data)) {
    return <RedirectingState />;
  }

  if (orgQ.isSuccess && orgQ.data && isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
    return <RedirectingState />;
  }

  if (settingsQ.isError) {
    const err = settingsQ.error;
    return (
      <ErrorState
        title="Could not load account details"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void settingsQ.refetch()}
      />
    );
  }

  if (meQ.isError) {
    const err = meQ.error;
    return (
      <ErrorState
        title="Could not load sign-in details"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void meQ.refetch()}
      />
    );
  }

  if (orgQ.isError) {
    const err = orgQ.error;
    return (
      <ErrorState
        title="Could not load organisation context"
        description={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void orgQ.refetch()}
      />
    );
  }

  if (!settingsQ.isSuccess || !settingsQ.data || isAccountSettingsGatewayRedirect(settingsQ.data)) {
    return null;
  }

  const settings = settingsQ.data.data;
  const summary = buildAccountSecuritySummary(
    settings,
    orgContextSlice,
    meQ.data?.data.user?.email,
  );
  const settingsHref = accountScopedRoutes.settings(accountId);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader
          title={summary.organisationTitle}
          description="Your account profile, sign-in details, and organisation authority."
        />
        <p className="text-muted-foreground text-sm">
          <Link
            href={settingsHref}
            className="text-primary focus-visible:ring-ring font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Organisation settings
          </Link>{" "}
          - preferences and bundle delivery.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={settings.isActive ? "default" : "destructive"} className="font-normal">
            {summary.activeLabel}
          </Badge>
          <Badge variant={settings.isSetup ? "secondary" : "outline"} className="font-normal">
            {summary.setupLabel}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {summary.sportLabel}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {summary.accountTypeLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-start-1 lg:row-start-1">
          <AccountSignInSecuritySection
            summary={summary}
            onEditDisplayName={() => profileDialog.onOpenChange(true)}
            onEditEmail={() => emailDialog.onOpenChange(true)}
            onEditPassword={passwordDialog.onEdit}
          />
        </div>
        <div className="lg:col-start-2">
          <AccountOverviewSection settings={settings} summary={summary} />
        </div>
      </div>

      <EditDisplayNameDialog {...profileDialog} />
      <EditLoginEmailDialog {...emailDialog} />
      <ChangePasswordDialog
        accountId={passwordDialog.accountId}
        formKey={passwordDialog.formKey}
        isOpen={passwordDialog.isOpen}
        onOpenChange={passwordDialog.onOpenChange}
      />
    </div>
  );
}
