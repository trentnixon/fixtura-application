"use client";

import { Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { TypographyMuted } from "@/components/typography";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type NotificationsProfileDraft,
  AccountInputRow,
  AccountSelectRow,
  WEEKDAY_OPTIONS,
  collectNotificationsChanges,
  daysUntilNextDelivery,
  equalNotificationsDraft,
  notificationsFieldId,
  weekdayLabel,
} from "@/features/notifications/bundle-delivery-profile-shared";
import {
  type AccountNotificationsLabDraft,
  accountLabBaseForState,
  notificationsLabDraftFromAccount,
} from "@/features/route-lab/fixtures/account";
import { type WeekdayKey } from "@/features/settings/bundle-delivery-weekdays";

export type NotificationsLabWorkspaceProps = {
  mode: "view" | "edit";
  scenarioKey: string;
  stubSaving: boolean;
};

function labDraftToProfile(d: AccountNotificationsLabDraft): NotificationsProfileDraft {
  return {
    bundleAddressedTo: d.bundleAddressedTo,
    deliveryEmail: d.deliveryEmail,
    assetDeliveryDay: d.assetDeliveryDay,
  };
}

export function NotificationsLabWorkspace({
  mode,
  scenarioKey,
  stubSaving,
}: NotificationsLabWorkspaceProps) {
  const baseData = useMemo(() => accountLabBaseForState(scenarioKey), [scenarioKey]);

  const [savedDraft, setSavedDraft] = useState<NotificationsProfileDraft>(() =>
    labDraftToProfile(notificationsLabDraftFromAccount(baseData)),
  );
  const [draft, setDraft] = useState<NotificationsProfileDraft>(() =>
    labDraftToProfile(notificationsLabDraftFromAccount(baseData)),
  );
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    const data = accountLabBaseForState(scenarioKey);
    const initial = labDraftToProfile(notificationsLabDraftFromAccount(data));
    setSavedDraft(initial);
    setDraft(initial);
    setConfirmedAt(null);
    setSaveDialogOpen(false);
  }, [scenarioKey, mode]);

  const interactive = mode === "edit" && !stubSaving;
  const fieldsEditable = interactive && scenarioKey !== "inactive";

  const hasChanges = !equalNotificationsDraft(draft, savedDraft);
  const saveDisabled = !interactive || stubSaving || !hasChanges;

  const editableChanges = useMemo(
    () => collectNotificationsChanges(savedDraft, draft),
    [savedDraft, draft],
  );

  function handleReset() {
    setDraft(labDraftToProfile(notificationsLabDraftFromAccount(baseData)));
  }

  function handleStubSave() {
    const stamp = new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    toast.success("Route lab: save not sent", {
      description: `No API request ran. (${stamp})`,
    });
    setConfirmedAt(stamp);
    setSavedDraft(draft);
    setSaveDialogOpen(false);
  }

  const fieldId = (key: keyof NotificationsProfileDraft) => notificationsFieldId("route-lab", key);

  const bundleSectionInner =
    mode === "view" ? (
      <div className="px-0 pb-0">
        <dl className="border-border divide-border divide-y border-t px-6">
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
              Bundle addressed to
            </dt>
            <dd className="text-foreground min-w-0 text-sm font-medium">
              {draft.bundleAddressedTo}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
              Delivery email
            </dt>
            <dd className="text-foreground min-w-0 text-sm font-medium">{draft.deliveryEmail}</dd>
          </div>
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
              Asset delivery day
            </dt>
            <dd className="text-foreground min-w-0 text-sm font-medium">
              {weekdayLabel(draft.assetDeliveryDay)}
            </dd>
          </div>
        </dl>
        <div className="border-border px-6 py-4">
          <TypographyMuted className="text-xs">
            View mode — bundle delivery fields are read-only.
          </TypographyMuted>
        </div>
      </div>
    ) : (
      <div className="px-0 pb-0">
        <ul>
          <AccountInputRow
            id={fieldId("bundleAddressedTo")}
            title="Bundle addressed to"
            description="Legal or display name used on generated bundles."
            disabled={!fieldsEditable}
            value={draft.bundleAddressedTo}
            onChange={(v) => setDraft((prev) => ({ ...prev, bundleAddressedTo: v }))}
          />
          <AccountInputRow
            id={fieldId("deliveryEmail")}
            title="Delivery email"
            description="Where weekly asset notifications and delivery are sent."
            type="email"
            disabled={!fieldsEditable}
            value={draft.deliveryEmail}
            onChange={(v) => setDraft((prev) => ({ ...prev, deliveryEmail: v }))}
          />
          <AccountSelectRow
            id={fieldId("assetDeliveryDay")}
            title="Asset delivery day"
            description={`Weekly generated assets are delivered on this day. Next delivery in ${daysUntilNextDelivery(draft.assetDeliveryDay)} days.`}
            disabled={!fieldsEditable}
            valueLabel={weekdayLabel(draft.assetDeliveryDay)}
          >
            <Select
              value={draft.assetDeliveryDay}
              onValueChange={(next) =>
                setDraft((prev) => ({ ...prev, assetDeliveryDay: next as WeekdayKey }))
              }
              disabled={!fieldsEditable}
            >
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_OPTIONS.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccountSelectRow>
        </ul>
        <div className="border-border px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <TypographyMuted className="text-xs">
              {interactive
                ? hasChanges
                  ? "You have unsaved changes."
                  : "No changes yet."
                : "Saving…"}
            </TypographyMuted>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!interactive || stubSaving}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button type="button" disabled={saveDisabled} onClick={() => setSaveDialogOpen(true)}>
                {stubSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader
          title={baseData.organisationName}
          description="Bundle delivery and notification preferences for weekly assets. Route lab — fixture only, no API."
        />
      </div>

      <Surface className="overflow-hidden p-0">
        <div className="bg-primary-950 flex w-full items-start gap-3 border-b border-white/15 px-6 py-5 text-white">
          <span className="mt-0.5 shrink-0 text-white/90">
            <Mail className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xl leading-none font-semibold text-white">Bundle delivery profile</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Where generated assets are addressed and when they are delivered.
            </p>
          </div>
        </div>
        {bundleSectionInner}
      </Surface>

      {confirmedAt ? (
        <p className="text-muted-foreground text-xs">
          Confirmed at {confirmedAt}. Route lab — no server save ran.
        </p>
      ) : null}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save notification preferences?</DialogTitle>
            <DialogDescription>
              Only the fields you changed are listed below. In Route Lab no server save runs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editableChanges.length ? (
              <div className="border-border space-y-2 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Changes
                </p>
                <ul className="text-foreground space-y-2 text-sm">
                  {editableChanges.map((row) => (
                    <li
                      key={row.label}
                      className="space-y-1 border-b border-dashed pb-2 last:border-0"
                    >
                      <p className="font-medium">{row.label}</p>
                      <p className="text-muted-foreground text-xs">
                        <span className="line-through">{row.before}</span>
                        <span className="text-foreground mx-2">→</span>
                        <span>{row.after}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <TypographyMuted className="text-sm">No changes to save.</TypographyMuted>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saveDisabled} onClick={handleStubSave}>
              Confirm (stub)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
