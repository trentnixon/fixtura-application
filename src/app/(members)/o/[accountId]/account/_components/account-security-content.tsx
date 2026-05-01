"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client/api-error";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { usePatchAccountSecurityLoginEmail } from "@/lib/api/hooks/account/usePatchAccountSecurityLoginEmail";
import { usePatchAccountSecurityProfile } from "@/lib/api/hooks/account/usePatchAccountSecurityProfile";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { accountScopedRoutes, isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";
import { ROUTES } from "@/lib/config/routes";

import {
  AccountDefinitionRow,
  accountYesNoBadge,
  AccountSectionShell,
} from "./account-display-primitives";

import type { AccountOrganisationContextData, AccountSettingsData } from "@/types/api/account";

function formatAccountDisplayName(settings: AccountSettingsData): string {
  const first = settings.FirstName?.trim() ?? "";
  const last = settings.LastName?.trim() ?? "";
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  return "—";
}

function deriveOrganisationTitle(
  settings: AccountSettingsData,
  context: AccountOrganisationContextData | undefined,
): string {
  const fromOrg = context?.accountOrganisationDetails?.Name?.trim();
  if (fromOrg) return fromOrg;
  const fromOnboarding = settings.onboardingOrganisationName?.trim();
  if (fromOnboarding) return fromOnboarding;
  return "—";
}

function deriveSport(
  settings: AccountSettingsData,
  context: AccountOrganisationContextData | undefined,
) {
  return context?.accountOrganisationDetails?.Sport?.trim() || settings.Sport?.trim() || "—";
}

function accountTypeLabel(accountTypeId: number | null | undefined): string {
  if (accountTypeId == null) return "—";
  return accountTypeId === CLUB_ACCOUNT_TYPE_ID ? "Club" : "Association";
}

export function AccountSecurityContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const settingsQ = useAccountSettings(accountId, { enabled: segmentOk });
  const meQ = useAccountMe({ enabled: segmentOk });
  const orgQ = useAccountOrganisationContext(accountId, { enabled: segmentOk });

  const patchProfile = usePatchAccountSecurityProfile(accountId);
  const patchEmail = usePatchAccountSecurityLoginEmail(accountId);

  const [profileOpen, setProfileOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  /** Remount password form fields when reopening dialog */
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const [profileValue, setProfileValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!settingsQ.isSuccess || !settingsQ.data || redirectingRef.current) return;
    if (!isAccountSettingsGatewayRedirect(settingsQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.settings(accountId) });
    router.replace(selectOrganisationUrlWithReason(settingsQ.data.reason));
  }, [settingsQ.isSuccess, settingsQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!orgQ.isSuccess || !orgQ.data || redirectingRef.current) return;
    if (!isAccountOrganisationContextGatewayRedirect(orgQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.organisationContext(accountId) });
    router.replace(selectOrganisationUrlWithReason(orgQ.data.reason));
  }, [orgQ.isSuccess, orgQ.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!profileOpen || !settingsQ.isSuccess || isAccountSettingsGatewayRedirect(settingsQ.data)) {
      return;
    }
    setProfileValue(formatAccountDisplayName(settingsQ.data.data).replace(/^—$/, ""));
    setProfileError(null);
  }, [profileOpen, settingsQ.isSuccess, settingsQ.data]);

  useEffect(() => {
    const email = meQ.data?.data.user?.email;
    if (!emailOpen || !email) return;
    setEmailValue(email);
    setEmailError(null);
  }, [emailOpen, meQ.data?.data.user?.email]);

  const orgContextSlice = useMemo(() => {
    if (!orgQ.isSuccess || !orgQ.data || isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
      return undefined;
    }
    return orgQ.data.data;
  }, [orgQ.isSuccess, orgQ.data]);

  if (!segmentOk) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (settingsQ.isPending || meQ.isPending || orgQ.isPending) {
    return <BrandedLoader label="Loading account" />;
  }

  if (settingsQ.isSuccess && settingsQ.data && isAccountSettingsGatewayRedirect(settingsQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
  }

  if (orgQ.isSuccess && orgQ.data && isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>Redirecting…</p>
      </div>
    );
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
  const loginEmail = meQ.data?.data.user?.email ?? "—";
  const organisationTitle = deriveOrganisationTitle(settings, orgContextSlice);
  const sportLine = deriveSport(settings, orgContextSlice);
  const typeLabel = accountTypeLabel(
    settings.account_type ?? orgContextSlice?.account_type ?? null,
  );
  const activeLabel = settings.isActive ? "Active" : "Inactive";
  const setupLabel = settings.isSetup ? "Setup complete" : "Setup pending";

  async function submitProfile() {
    const trimmed = profileValue.trim();
    if (!trimmed) {
      setProfileError("Enter a display name.");
      return;
    }
    setProfileError(null);
    try {
      await patchProfile.mutateAsync({ userName: trimmed });
      toast.success("Display name updated");
      setProfileOpen(false);
    } catch (e) {
      setProfileError(e instanceof ApiError ? e.message : AUTH_ERROR_MESSAGES.unexpected);
    }
  }

  async function submitEmail() {
    const trimmed = emailValue.trim().toLowerCase();
    const parsed = z.string().email().safeParse(trimmed);
    if (!parsed.success) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    try {
      await patchEmail.mutateAsync({ loginEmail: parsed.data });
      toast.success("Login email updated");
      setEmailOpen(false);
    } catch (e) {
      setEmailError(e instanceof ApiError ? e.message : AUTH_ERROR_MESSAGES.unexpected);
    }
  }

  const statusBadges = (
    <div className="flex flex-wrap gap-2">
      <Badge variant={settings.isActive ? "default" : "destructive"} className="font-normal">
        {activeLabel}
      </Badge>
      <Badge variant={settings.isSetup ? "secondary" : "outline"} className="font-normal">
        {setupLabel}
      </Badge>
      <Badge variant="outline" className="font-normal">
        {sportLine}
      </Badge>
      <Badge variant="outline" className="font-normal">
        {typeLabel}
      </Badge>
    </div>
  );

  const setupBanner = settings.isSetup ? null : (
    <div className="bg-muted/50 text-muted-foreground mt-2 rounded-lg border px-4 py-3 text-sm">
      Setup is not complete yet.{" "}
      <Link
        href={ROUTES.createOrganisationSetup}
        className="text-foreground hover:text-foreground font-medium underline underline-offset-4"
      >
        Continue setup
      </Link>{" "}
      or{" "}
      <Link
        href={ROUTES.createOrganisation}
        className="text-foreground hover:text-foreground font-medium underline underline-offset-4"
      >
        return to onboarding
      </Link>
      .
    </div>
  );

  const overviewInner: ReactNode = (
    <div className="px-0 pb-0">
      <div className="border-border space-y-4 border-b px-6 py-5">
        <div>
          <p className="text-sm font-medium">Organisation</p>
          <p className="text-foreground mt-1 text-lg font-semibold">{organisationTitle}</p>
        </div>
        {setupBanner}
        {/* Member since / last updated omitted: not on typed AccountSettings/me payloads today. */}
        <dl className="border-border divide-border divide-y border-t">
          <AccountDefinitionRow label="Sport" value={sportLine} />
          <AccountDefinitionRow label="Account type" value={typeLabel} />
        </dl>
      </div>
      <ul>
        <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">Rights holder</div>
            <TypographyMuted className="text-xs">
              You are authorised to manage assets in an official capacity for this organisation.
            </TypographyMuted>
          </div>
          {accountYesNoBadge(settings.isRightsHolder)}
        </li>
        <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">Permission given</div>
            <TypographyMuted className="text-xs">
              You have permission to generate and deliver assets for this organisation.
            </TypographyMuted>
          </div>
          {accountYesNoBadge(settings.isPermissionGiven)}
        </li>
      </ul>
    </div>
  );

  const securityInner = (
    <div className="px-0 pb-0">
      <ul className="border-border divide-border divide-y border-t">
        <li className="border-border flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">User name</div>
            <div className="text-foreground truncate text-sm">
              {formatAccountDisplayName(settings)}
            </div>
          </div>
          <form
            className="shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              setProfileOpen(true);
            }}
          >
            <Button type="submit" variant="outline" className="rounded-xl">
              Change user name
            </Button>
          </form>
        </li>
        <li className="border-border flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">Login email</div>
            <div className="text-foreground flex min-w-0 items-center gap-2 truncate text-sm">
              <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
              <span className="truncate">{loginEmail}</span>
            </div>
          </div>
          <form
            className="shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              setEmailOpen(true);
            }}
          >
            <Button type="submit" variant="outline" className="rounded-xl">
              Change login email
            </Button>
          </form>
        </li>
        <li className="border-border flex flex-col gap-3 border-b px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">Password</div>
            <div className="text-foreground text-sm tracking-widest tabular-nums">••••••••</div>
          </div>
          <form
            className="shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              setPasswordFormKey((k) => k + 1);
              setPasswordDialogOpen(true);
            }}
          >
            <Button type="submit" variant="outline" className="rounded-xl">
              Change password
            </Button>
          </form>
        </li>
      </ul>
    </div>
  );

  const settingsHref = accountScopedRoutes.settings(accountId);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader
          title={organisationTitle}
          description="Your account profile, sign-in details, and organisation authority."
        />
        <p className="text-muted-foreground text-sm">
          <Link
            href={settingsHref}
            className="text-primary focus-visible:ring-ring font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Organisation settings
          </Link>{" "}
          — preferences and bundle delivery.
        </p>
        {statusBadges}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-start-1 lg:row-start-1">
          <AccountSectionShell
            title="Sign-in and security"
            description="How you sign in and credentials for this account."
            icon={<ShieldCheck className="size-5" aria-hidden />}
            headerTone="brand"
          >
            {securityInner}
          </AccountSectionShell>
        </div>
        <div className="lg:col-start-2">
          <AccountSectionShell
            title="Account overview & organisation access"
            description="Organisation context, membership details, and authority for this account."
            icon={<ShieldCheck className="size-5" aria-hidden />}
            headerTone="slate"
          >
            {overviewInner}
          </AccountSectionShell>
        </div>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change display name</DialogTitle>
            <DialogDescription>
              This is how your name appears in Fixtura. It is stored on your organisation account
              profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="account-profile-name">Display name</Label>
            <Input
              id="account-profile-name"
              value={profileValue}
              onChange={(e) => setProfileValue(e.target.value)}
              autoComplete="name"
              disabled={patchProfile.isPending}
            />
            {profileError ? (
              <p className="text-destructive text-sm" role="alert">
                {profileError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={patchProfile.isPending}
              onClick={() => void submitProfile()}
            >
              {patchProfile.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change login email</DialogTitle>
            <DialogDescription>
              Your login email is updated immediately. It may differ from your bundle delivery email
              in organisation settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="account-login-email">Login email</Label>
            <Input
              id="account-login-email"
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              autoComplete="email"
              disabled={patchEmail.isPending}
            />
            {emailError ? (
              <p className="text-destructive text-sm" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={patchEmail.isPending}
              onClick={() => void submitEmail()}
            >
              {patchEmail.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Current password required. Pick a strong password at least 8 characters. Strength
              hints are informational only.
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm
            key={passwordFormKey}
            accountId={accountId}
            onDismiss={() => setPasswordDialogOpen(false)}
            onSuccess={() => setPasswordDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
