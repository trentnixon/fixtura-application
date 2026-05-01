"use client";

import { CalendarDays, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Surface } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AccountLabEditableDraft,
  editableDraftFromAccount,
  accountLabBaseForState,
} from "@/features/route-lab/fixtures/account";
import { cn } from "@/lib/utils";

export type AccountLabWorkspaceProps = {
  mode: "view" | "edit";
  scenarioKey: string;
  stubSaving: boolean;
};

function editableFieldId(key: keyof AccountLabEditableDraft) {
  return `route-lab-account-${key}`;
}

function AccountDefinitionRow(props: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
        {props.label}
      </dt>
      <dd className="text-foreground min-w-0 text-sm font-medium">{props.value}</dd>
    </div>
  );
}

function yesNoBadge(value: boolean) {
  return (
    <Badge variant={value ? "default" : "secondary"} className="font-normal">
      {value ? "Yes" : "No"}
    </Badge>
  );
}

function passwordStrengthHint(password: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!password) return { level: 0, label: "" };
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (password.length < 8 || classes <= 1) return { level: 1, label: "Weak" };
  if (password.length < 10 || classes === 2) return { level: 2, label: "Fair" };
  if (password.length < 12 || classes === 3) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}

const STRENGTH_BAR_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "bg-destructive/80",
  2: "bg-amber-500",
  3: "bg-yellow-500",
  4: "bg-emerald-600",
};

function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label } = passwordStrengthHint(password);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">Password strength</span>
        {level > 0 ? (
          <span className="text-foreground text-xs font-medium">{label}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </div>
      <div className="flex gap-1" aria-hidden>
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              level > 0 && i <= level ? STRENGTH_BAR_COLORS[level] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-[11px] leading-snug">
        For feedback only — not used to validate or block saving in this lab.
      </p>
    </div>
  );
}

function LabPasswordField(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  const { id, label, value, onChange, show, onToggleShow } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl pr-10"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          {show ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

export function AccountLabWorkspace({ mode, scenarioKey, stubSaving }: AccountLabWorkspaceProps) {
  const baseData = useMemo(() => accountLabBaseForState(scenarioKey), [scenarioKey]);

  const [userName, setUserName] = useState(() => editableDraftFromAccount(baseData).userName);
  const [loginEmail, setLoginEmail] = useState(() => editableDraftFromAccount(baseData).loginEmail);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userNameDialogOpen, setUserNameDialogOpen] = useState(false);
  const [loginEmailDialogOpen, setLoginEmailDialogOpen] = useState(false);
  const [userNameDraft, setUserNameDraft] = useState("");
  const [loginEmailDraft, setLoginEmailDraft] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordNewVisible, setPasswordNewVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  useEffect(() => {
    const data = accountLabBaseForState(scenarioKey);
    const initial = editableDraftFromAccount(data);
    setUserName(initial.userName);
    setLoginEmail(initial.loginEmail);
    setPasswordDialogOpen(false);
    setUserNameDialogOpen(false);
    setLoginEmailDialogOpen(false);
    setUserNameDraft("");
    setLoginEmailDraft("");
    setDeleteDialogOpen(false);
    setPasswordNew("");
    setPasswordConfirm("");
    setPasswordNewVisible(false);
    setPasswordConfirmVisible(false);
  }, [scenarioKey, mode]);

  useEffect(() => {
    if (!passwordDialogOpen) {
      setPasswordNewVisible(false);
      setPasswordConfirmVisible(false);
    }
  }, [passwordDialogOpen]);

  const securityEditable = mode === "edit" && !stubSaving;

  const setupPending = !baseData.isSetup;
  const activeLabel = baseData.isActive ? "Active" : "Inactive";
  const setupLabel = baseData.isSetup ? "Setup complete" : "Setup pending";

  function stubFieldSave(fieldLabel: string) {
    const stamp = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    toast.success(`Route lab: ${fieldLabel} — request not sent`, {
      description: `No API or network request ran. (${stamp})`,
    });
  }

  function handleStubDeleteConfirm() {
    toast.success("Route lab: account not deleted", {
      description: "No API request ran. This action would be permanent in production.",
    });
    setDeleteDialogOpen(false);
  }

  function handlePasswordStubSubmit() {
    if (passwordNew.length < 8) {
      toast.error("Route lab", { description: "Use at least 8 characters for this stub check." });
      return;
    }
    if (passwordNew !== passwordConfirm) {
      toast.error("Route lab", { description: "Passwords do not match." });
      return;
    }
    toast.success("Route lab: password not changed");
    setPasswordDialogOpen(false);
    setPasswordNew("");
    setPasswordConfirm("");
  }

  function handleUserNameStubSubmit() {
    const next = userNameDraft.trim();
    if (!next) {
      toast.error("Route lab", { description: "Enter a user name." });
      return;
    }
    setUserName(next);
    stubFieldSave("User name");
    setUserNameDialogOpen(false);
  }

  function handleLoginEmailStubSubmit() {
    const result = z
      .string()
      .trim()
      .min(1, "Enter an email address.")
      .email("Enter a valid email address.")
      .safeParse(loginEmailDraft);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Enter a valid email address.";
      toast.error("Route lab", { description: message });
      return;
    }

    setLoginEmail(result.data);
    stubFieldSave("Login email");
    setLoginEmailDialogOpen(false);
  }

  const statusStrip = (
    <div className="flex flex-wrap gap-2">
      <Badge variant={baseData.isActive ? "default" : "destructive"} className="font-normal">
        {activeLabel}
      </Badge>
      <Badge variant={baseData.isSetup ? "secondary" : "outline"} className="font-normal">
        {setupLabel}
      </Badge>
      <Badge variant="outline" className="font-normal">
        {baseData.sport}
      </Badge>
      <Badge variant="outline" className="font-normal">
        {baseData.accountType}
      </Badge>
    </div>
  );

  const overviewAndOrganisationAccessInner = (
    <div className="px-0 pb-0">
      <div className="border-border space-y-4 border-b px-6 py-5">
        <div>
          <p className="text-sm font-medium">Organisation</p>
          <p className="text-foreground mt-1 text-lg font-semibold">{baseData.organisationName}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Member since
            </span>
            <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="text-muted-foreground size-4 shrink-0" />
              {baseData.memberSince}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Last updated
            </span>
            <span className="text-foreground text-sm font-medium">{baseData.lastUpdated}</span>
          </div>
        </div>
        {setupPending ? (
          <div className="bg-muted/50 text-muted-foreground rounded-lg border px-4 py-3 text-sm">
            Setup is not complete yet.{" "}
            <Button type="button" variant="link" className="text-foreground h-auto p-0 font-medium">
              Continue setup
            </Button>{" "}
            (stub in Route Lab).
          </div>
        ) : null}
        <dl className="border-border divide-border divide-y border-t">
          <AccountDefinitionRow label="Sport" value={baseData.sport} />
          <AccountDefinitionRow label="Account type" value={baseData.accountType} />
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
          {yesNoBadge(baseData.isRightsHolder)}
        </li>
        <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-medium">Permission given</div>
            <TypographyMuted className="text-xs">
              Confirm that you have permission to generate and deliver assets for this organisation.
            </TypographyMuted>
          </div>
          {yesNoBadge(baseData.isPermissionGiven)}
        </li>
      </ul>
    </div>
  );

  const securitySectionInner =
    mode === "view" ? (
      <div className="px-0 pb-0">
        <dl className="border-border divide-border divide-y border-t px-6">
          <AccountDefinitionRow label="User name" value={userName} />
          <AccountDefinitionRow
            label="Login email"
            value={
              <span className="inline-flex items-center gap-2">
                <Mail className="text-muted-foreground size-4 shrink-0" />
                {loginEmail}
              </span>
            }
          />
          <AccountDefinitionRow label="Password" value="••••••••" />
        </dl>
        <div className="border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={stubSaving}
            onClick={() => setPasswordDialogOpen(true)}
            className="rounded-xl"
          >
            Change password
          </Button>
        </div>
      </div>
    ) : (
      <div className="px-0 pb-0">
        <ul>
          <li className="border-border flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-medium">User name</div>
              <div className="text-foreground truncate text-sm">{userName}</div>
            </div>
            <form
              className="shrink-0"
              onSubmit={(e) => {
                e.preventDefault();
                if (!stubSaving && securityEditable) {
                  setUserNameDraft(userName);
                  setUserNameDialogOpen(true);
                }
              }}
            >
              <Button
                type="submit"
                variant="outline"
                disabled={stubSaving || !securityEditable}
                className="rounded-xl"
              >
                Change user name
              </Button>
            </form>
          </li>
          <li className="border-border flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-medium">Login email</div>
              <div className="text-foreground flex min-w-0 items-center gap-2 truncate text-sm">
                <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
                {loginEmail}
              </div>
            </div>
            <form
              className="shrink-0"
              onSubmit={(e) => {
                e.preventDefault();
                if (!stubSaving && securityEditable) {
                  setLoginEmailDraft(loginEmail);
                  setLoginEmailDialogOpen(true);
                }
              }}
            >
              <Button
                type="submit"
                variant="outline"
                disabled={stubSaving || !securityEditable}
                className="rounded-xl"
              >
                Change login email
              </Button>
            </form>
          </li>
          <li className="border-border flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-medium">Password</div>
              <div className="text-foreground text-sm tabular-nums">••••••••</div>
            </div>
            <form
              className="shrink-0"
              onSubmit={(e) => {
                e.preventDefault();
                if (!stubSaving && securityEditable) setPasswordDialogOpen(true);
              }}
            >
              <Button
                type="submit"
                variant="outline"
                disabled={stubSaving || !securityEditable}
                className="rounded-xl"
              >
                Change password
              </Button>
            </form>
          </li>
        </ul>
      </div>
    );

  function sectionShell(
    title: string,
    description: string,
    icon: ReactNode,
    children: ReactNode,
    options?: { headerTone?: "brand" | "slate" },
  ) {
    const tone = options?.headerTone ?? "brand";
    const headerClass =
      tone === "brand"
        ? "bg-primary-950 border-white/15 text-white"
        : "bg-slate-900 border-slate-800/80 text-white";

    const iconClass = tone === "brand" ? "text-white/90" : "text-slate-400";
    const titleClass = "text-xl leading-none font-semibold text-white";
    const descClass = tone === "brand" ? "text-white/80" : "text-slate-400";

    return (
      <Surface className="overflow-hidden p-0">
        <div className={`flex w-full items-start gap-3 border-b px-6 py-5 ${headerClass}`}>
          <span className={`mt-0.5 shrink-0 ${iconClass}`}>{icon}</span>
          <div>
            <p className={titleClass}>{title}</p>
            <p className={`mt-2 text-sm leading-relaxed ${descClass}`}>{description}</p>
          </div>
        </div>
        {children}
      </Surface>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader
          title={baseData.organisationName}
          description="Your account profile, sign-in details, and organisation context. Bundle delivery lab: `/sandbox/route-lab/app/notifications`."
        />
        {statusStrip}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 lg:col-start-1 lg:row-start-1">
          {sectionShell(
            "Sign-in and security",
            "How you sign in and credentials for this account.",
            <ShieldCheck className="size-5" aria-hidden />,
            securitySectionInner,
          )}
        </div>
        <div className="space-y-6 lg:col-start-2">
          {sectionShell(
            "Account overview & organisation access",
            "Organisation context, membership details, and authority for this account.",
            <ShieldCheck className="size-5" aria-hidden />,
            overviewAndOrganisationAccessInner,
            { headerTone: "slate" },
          )}
        </div>
      </div>

      {/* Kitchen sink reference: list.card-row.settings.destructive */}
      <Surface className="border-destructive/15 ring-destructive/10 overflow-hidden p-0">
        <div className="bg-muted border-b px-6 py-4">
          <TypographyH4 className="text-sm font-semibold">Danger zone</TypographyH4>
          <TypographyMuted className="mt-1 text-sm">
            Destructive settings stay visually separated. Route Lab — confirmation is stubbed;
            nothing is deleted.
          </TypographyMuted>
        </div>
        <div className="px-0 pb-0">
          <ul>
            <li className="border-border hover:bg-destructive/5 flex items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0">
              <div className="min-w-0 space-y-1">
                <div className="text-destructive text-sm font-medium">Delete account</div>
                <TypographyMuted className="text-xs">
                  Permanently delete this account and remove your access to Fixtura. In production
                  this cannot be undone.
                </TypographyMuted>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="shrink-0"
                disabled={stubSaving}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete account
              </Button>
            </li>
          </ul>
        </div>
      </Surface>

      <Dialog
        open={userNameDialogOpen}
        onOpenChange={(open) => {
          setUserNameDialogOpen(open);
          if (open) setUserNameDraft(userName);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user name</DialogTitle>
            <DialogDescription>
              Route Lab stub only — no request updates your profile on the server.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={editableFieldId("userName")}>User name</Label>
            <Input
              id={editableFieldId("userName")}
              value={userNameDraft}
              onChange={(e) => setUserNameDraft(e.target.value)}
              autoComplete="name"
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUserNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUserNameStubSubmit}>
              Save (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={loginEmailDialogOpen}
        onOpenChange={(open) => {
          setLoginEmailDialogOpen(open);
          if (open) setLoginEmailDraft(loginEmail);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change login email</DialogTitle>
            <DialogDescription>
              Route Lab stub only — no request updates your sign-in email on the server.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={editableFieldId("loginEmail")}>Login email</Label>
            <Input
              id={editableFieldId("loginEmail")}
              type="email"
              value={loginEmailDraft}
              onChange={(e) => setLoginEmailDraft(e.target.value)}
              autoComplete="email"
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLoginEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleLoginEmailStubSubmit}>
              Save (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Route Lab stub only — your password is not updated and no request is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <LabPasswordField
                id="route-lab-account-pw-new"
                label="New password"
                value={passwordNew}
                onChange={setPasswordNew}
                show={passwordNewVisible}
                onToggleShow={() => setPasswordNewVisible((v) => !v)}
              />
              <PasswordStrengthMeter password={passwordNew} />
            </div>
            <LabPasswordField
              id="route-lab-account-pw-confirm"
              label="Confirm password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              show={passwordConfirmVisible}
              onToggleShow={() => setPasswordConfirmVisible((v) => !v)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePasswordStubSubmit}>
              Update password (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This would permanently remove your Fixtura account and access in production. Route Lab
              stub only — confirming does not delete anything.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={stubSaving}
              onClick={handleStubDeleteConfirm}
            >
              Delete account (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
