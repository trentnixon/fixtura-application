"use client";

import { Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
} from "@/features/notifications/bundle-delivery-profile-shared";
import {
  cmsDaysOfWeekIdFromWeekdayKey,
  type WeekdayKey,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { usePatchAccountSettings } from "@/lib/api/hooks/account/usePatchAccountSettings";
import { useUpdateOnboardingStep3 } from "@/lib/api/hooks/account/useUpdateOnboardingStep3";
import { toastError, toastSuccess } from "@/lib/notify";

import type {
  AccountNotificationsData,
  PatchAccountSettingsBody,
  UpdateOnboardingStep3Body,
} from "@/types/api/account";

const FIELD_PREFIX = "members";

function weekdayKeyFromApi(value: string | null): WeekdayKey | undefined {
  if (!value) return undefined;
  return WEEKDAY_OPTIONS.find((o) => o.key === value)?.key;
}

function dataToProfileDraft(d: AccountNotificationsData): NotificationsProfileDraft {
  return {
    bundleAddressedTo: d.bundleAddressedTo ?? "",
    deliveryEmail: d.deliveryEmail ?? "",
    assetDeliveryDay: weekdayKeyFromApi(d.assetDeliveryDay) ?? "sunday",
  };
}

function dayBaselineFromData(d: AccountNotificationsData): WeekdayKey {
  return weekdayKeyFromApi(d.assetDeliveryDay) ?? "sunday";
}

function normalizeEmailCompare(s: string): string {
  return s.trim().toLowerCase();
}

function buildContactStep3Patch(
  saved: AccountNotificationsData,
  draft: NotificationsProfileDraft,
): UpdateOnboardingStep3Body | null {
  const out: UpdateOnboardingStep3Body = {};
  const nextBundle = draft.bundleAddressedTo.trim();
  const prevBundle = (saved.bundleAddressedTo ?? "").trim();
  if (nextBundle !== prevBundle) {
    out.firstName = nextBundle === "" ? null : nextBundle;
  }
  const nextEmail = normalizeEmailCompare(draft.deliveryEmail);
  const prevEmail = normalizeEmailCompare(saved.deliveryEmail ?? "");
  if (nextEmail !== prevEmail) {
    const trimmed = draft.deliveryEmail.trim();
    out.deliveryAddress = trimmed === "" ? null : trimmed;
  }
  if (Object.keys(out).length === 0) return null;
  return out;
}

function settingsPatchForDeliveryDay(
  draftDay: WeekdayKey,
): Pick<PatchAccountSettingsBody, "daysOfTheWeekId" | "bundleDeliveryDay"> {
  const id = cmsDaysOfWeekIdFromWeekdayKey(draftDay);
  if (id !== undefined) return { daysOfTheWeekId: id };
  return { bundleDeliveryDay: weekdayLabel(draftDay) };
}

export function NotificationsForm({
  accountId,
  data,
}: {
  accountId: string;
  data: AccountNotificationsData;
}) {
  const orgQ = useAccountOrganisationContext(accountId);
  const orgName =
    orgQ.isSuccess &&
    orgQ.data &&
    !isAccountOrganisationContextGatewayRedirect(orgQ.data) &&
    orgQ.data.data.accountOrganisationDetails?.Name
      ? orgQ.data.data.accountOrganisationDetails.Name
      : "Organisation";

  const hasParsableAssetDeliveryDay =
    data.assetDeliveryDay != null && WEEKDAY_OPTIONS.some((o) => o.key === data.assetDeliveryDay);

  const patchStep3 = useUpdateOnboardingStep3(accountId);
  const patchSettings = usePatchAccountSettings(accountId);

  const [savedDraft, setSavedDraft] = useState<NotificationsProfileDraft>(() =>
    dataToProfileDraft(data),
  );
  const [draft, setDraft] = useState<NotificationsProfileDraft>(() => dataToProfileDraft(data));
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  useEffect(() => {
    const next = dataToProfileDraft({
      bundleAddressedTo: data.bundleAddressedTo,
      deliveryEmail: data.deliveryEmail,
      assetDeliveryDay: data.assetDeliveryDay,
    });
    setSavedDraft(next);
    setDraft(next);
  }, [data.bundleAddressedTo, data.deliveryEmail, data.assetDeliveryDay]);

  const saving = patchStep3.isPending || patchSettings.isPending;
  const interactive = !saving;
  const fieldsEditable = interactive;

  const hasChanges = !equalNotificationsDraft(draft, savedDraft);
  const saveDisabled = !interactive || !hasChanges;

  const contactSaveForbidden =
    patchStep3.error instanceof ApiError && patchStep3.error.status === 403;
  const settingsSaveForbidden =
    patchSettings.error instanceof ApiError && patchSettings.error.status === 403;

  const editableChanges = useMemo(
    () => collectNotificationsChanges(savedDraft, draft),
    [savedDraft, draft],
  );

  function handleReset() {
    setDraft(dataToProfileDraft(data));
  }

  async function handleConfirmSave() {
    const contactPatch = buildContactStep3Patch(data, draft);
    const dayChanged = dayBaselineFromData(data) !== draft.assetDeliveryDay;

    if (!contactPatch && !dayChanged) {
      setSaveDialogOpen(false);
      return;
    }

    try {
      if (contactPatch) {
        await patchStep3.mutateAsync(contactPatch);
      }
      if (dayChanged) {
        await patchSettings.mutateAsync(settingsPatchForDeliveryDay(draft.assetDeliveryDay));
      }
      const stamp = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setConfirmedAt(stamp);
      toastSuccess("Notification preferences saved");
      setSaveDialogOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) return;
      toastError(e, "Could not save");
    }
  }

  const fieldId = (key: keyof NotificationsProfileDraft) => notificationsFieldId(FIELD_PREFIX, key);

  const bundleSectionInner = (
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
          description={`Weekly generated assets are delivered on this day. Next delivery in ${daysUntilNextDelivery(draft.assetDeliveryDay)} days.${
            !hasParsableAssetDeliveryDay
              ? " Could not resolve your saved weekday from the server; the selection defaults until you save."
              : ""
          }`}
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
            <Button type="button" variant="outline" disabled={!interactive} onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" disabled={saveDisabled} onClick={() => setSaveDialogOpen(true)}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {contactSaveForbidden ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-lg border px-4 py-3 text-sm"
        >
          Saving bundle addressee or delivery email is blocked (403): enable the{" "}
          <strong>updateOnboardingStep3</strong> permission for your role in Strapi (contact /
          delivery fields on the account).
        </div>
      ) : null}
      {settingsSaveForbidden ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-lg border px-4 py-3 text-sm"
        >
          Saving asset delivery day is blocked (403): enable the{" "}
          <strong>saveAccountSettings</strong> permission for your role in Strapi.
        </div>
      ) : null}

      {!contactSaveForbidden &&
      patchStep3.isError &&
      patchStep3.error instanceof ApiError &&
      patchStep3.error.status !== 403 ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 rounded-lg border px-4 py-3 text-sm text-red-950 dark:text-red-100"
        >
          <span className="font-medium">{patchStep3.error.message}</span>
        </div>
      ) : null}
      {!settingsSaveForbidden &&
      patchSettings.isError &&
      patchSettings.error instanceof ApiError &&
      patchSettings.error.status !== 403 ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 rounded-lg border px-4 py-3 text-sm text-red-950 dark:text-red-100"
        >
          <span className="font-medium">{patchSettings.error.message}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        <PageHeader
          title={orgName}
          description="Bundle delivery and notification preferences for weekly assets."
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
        <p className="text-muted-foreground text-xs">Saved at {confirmedAt}.</p>
      ) : null}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-h-[min(90vh,800px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save notification preferences?</DialogTitle>
            <DialogDescription>
              Only the fields you changed are listed below. Your changes are saved to your
              organisation.
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
            <Button
              type="button"
              disabled={saveDisabled || contactSaveForbidden || settingsSaveForbidden}
              onClick={() => void handleConfirmSave()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
