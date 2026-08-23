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
import { type WeekdayKey, weekdayLabel } from "@/features/settings/bundle-delivery-weekdays";
import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { usePatchAccountNotifications } from "@/lib/api/hooks/account/usePatchAccountNotifications";
import { usePatchAccountSettings } from "@/lib/api/hooks/account/usePatchAccountSettings";
import { toastError, toastSuccess } from "@/lib/notify";
import { SUPPORT_READ_ONLY_FORM_DESCRIPTION } from "@/lib/support/support-read-only-copy";
import { useAccountReadOnly } from "@/lib/support/use-account-read-only";

import {
  applyPartialSaveToSavedDraft,
  getNotificationsSaveSuccessMessage,
  getNotificationsSaveUserMessage,
  isNotificationsSaveFullySuccessful,
  runNotificationsSave,
} from "../_utils/notifications-partial-save";
import {
  buildPatchAccountNotificationsBody,
  dataToProfileDraft,
  hasDeliveryDayChange,
  hasParsableAssetDeliveryDay,
  settingsPatchForDeliveryDay,
} from "../_utils/notifications-save";
import { validateNotificationsDeliveryEmailValue } from "../_utils/notifications-validation";

import type { AccountNotificationsData } from "@/types/api/account";

const FIELD_PREFIX = "members";

export function NotificationsForm({
  accountId,
  data,
}: {
  accountId: string;
  data: AccountNotificationsData;
}) {
  const readOnly = useAccountReadOnly();
  const orgQ = useAccountOrganisationContext(accountId);
  const orgName =
    orgQ.isSuccess &&
    orgQ.data &&
    !isAccountOrganisationContextGatewayRedirect(orgQ.data) &&
    orgQ.data.data.accountOrganisationDetails?.Name
      ? orgQ.data.data.accountOrganisationDetails.Name
      : "Organisation";

  const parsableAssetDeliveryDay = hasParsableAssetDeliveryDay(data);
  const { bundleAddressedTo, deliveryEmail, assetDeliveryDay } = data;

  const patchNotifications = usePatchAccountNotifications(accountId);
  const patchSettings = usePatchAccountSettings(accountId);

  const [savedDraft, setSavedDraft] = useState<NotificationsProfileDraft>(() =>
    dataToProfileDraft(data),
  );
  const [draft, setDraft] = useState<NotificationsProfileDraft>(() => dataToProfileDraft(data));
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [partialSaveAlert, setPartialSaveAlert] = useState<string | null>(null);
  const [deliveryEmailError, setDeliveryEmailError] = useState<string | null>(null);

  useEffect(() => {
    const next = dataToProfileDraft({ bundleAddressedTo, deliveryEmail, assetDeliveryDay });
    setSavedDraft(next);
    setDraft(next);
  }, [bundleAddressedTo, deliveryEmail, assetDeliveryDay]);

  const saving = patchNotifications.isPending || patchSettings.isPending;
  const interactive = !saving && !readOnly;
  const fieldsEditable = interactive;

  const hasChanges = !equalNotificationsDraft(draft, savedDraft);
  const saveDisabled = !interactive || !hasChanges;

  const contactSaveForbidden =
    patchNotifications.error instanceof ApiError && patchNotifications.error.status === 403;
  const settingsSaveForbidden =
    patchSettings.error instanceof ApiError && patchSettings.error.status === 403;

  const editableChanges = useMemo(
    () => collectNotificationsChanges(savedDraft, draft),
    [savedDraft, draft],
  );

  function handleReset() {
    setDraft(dataToProfileDraft(data));
    setDeliveryEmailError(null);
    setPartialSaveAlert(null);
  }

  function validateDraftEmail(): boolean {
    const { error } = validateNotificationsDeliveryEmailValue(draft.deliveryEmail);
    setDeliveryEmailError(error);
    return !error;
  }

  function handleOpenSaveDialog() {
    if (!validateDraftEmail()) return;
    setPartialSaveAlert(null);
    setSaveDialogOpen(true);
  }

  async function handleConfirmSave() {
    if (!validateDraftEmail()) {
      setSaveDialogOpen(false);
      return;
    }

    const contactPatch = buildPatchAccountNotificationsBody(data, draft);
    const dayChanged = hasDeliveryDayChange(data, draft);

    if (!contactPatch && !dayChanged) {
      setSaveDialogOpen(false);
      return;
    }

    const outcome = await runNotificationsSave({
      contactPatch,
      deliveryDayPatch: dayChanged ? settingsPatchForDeliveryDay(draft.assetDeliveryDay) : null,
      patchContact: (body) => patchNotifications.mutateAsync(body),
      patchDeliveryDay: (body) => patchSettings.mutateAsync(body),
    });

    const { toast, alert } = getNotificationsSaveUserMessage(outcome);

    if (isNotificationsSaveFullySuccessful(outcome)) {
      const fieldsChanged: string[] = [];
      if (contactPatch) {
        if (contactPatch.deliveryEmail !== undefined) fieldsChanged.push("delivery_email");
        if (contactPatch.bundleAddressedTo !== undefined) fieldsChanged.push("bundle_addressed_to");
      }
      if (dayChanged) fieldsChanged.push("delivery_weekday");
      captureUserAction("notifications_saved", { accountId, fields_changed: fieldsChanged });

      const stamp = new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setConfirmedAt(stamp);
      setPartialSaveAlert(null);
      setSaveDialogOpen(false);
      const nextSaved = applyPartialSaveToSavedDraft(savedDraft, draft, outcome);
      setSavedDraft(nextSaved);
      setDraft(nextSaved);
      if (toast === "success") {
        toastSuccess(getNotificationsSaveSuccessMessage());
      }
      return;
    }

    const nextSaved = applyPartialSaveToSavedDraft(savedDraft, draft, outcome);
    setSavedDraft(nextSaved);
    setDraft(nextSaved);
    setPartialSaveAlert(alert);
    setSaveDialogOpen(false);

    if (toast === "error") {
      const mutationError = outcome.contactError ?? outcome.deliveryDayError;
      if (mutationError && mutationError.status !== 403) {
        toastError(mutationError, "Could not save");
      } else if (alert) {
        toastError(new Error(alert), "Could not save");
      }
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
          onChange={(v) => {
            setDeliveryEmailError(null);
            setDraft((prev) => ({ ...prev, deliveryEmail: v }));
          }}
        />
        {deliveryEmailError ? (
          <li className="border-border border-b px-6 pb-4">
            <p role="alert" className="text-destructive text-sm">
              {deliveryEmailError}
            </p>
          </li>
        ) : null}
        <AccountSelectRow
          id={fieldId("assetDeliveryDay")}
          title="Asset delivery day"
          description={`Weekly generated assets are delivered on this day. Next delivery in ${daysUntilNextDelivery(draft.assetDeliveryDay)} days.${
            !parsableAssetDeliveryDay
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
            {readOnly
              ? "Read-only support view."
              : interactive
                ? hasChanges
                  ? "You have unsaved changes."
                  : "No changes yet."
                : "Saving…"}
          </TypographyMuted>
          {!readOnly ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={!interactive} onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" disabled={saveDisabled} onClick={handleOpenSaveDialog}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {readOnly ? (
        <div
          role="status"
          className="border-border bg-muted/40 text-muted-foreground rounded-lg border px-4 py-3 text-sm"
        >
          {SUPPORT_READ_ONLY_FORM_DESCRIPTION}
        </div>
      ) : null}

      {partialSaveAlert ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
        >
          {partialSaveAlert}
        </div>
      ) : null}

      {contactSaveForbidden ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-lg border px-4 py-3 text-sm"
        >
          Saving bundle addressee or delivery email is blocked (403): enable the{" "}
          <strong>saveAccountNotifications</strong> permission for your role in Strapi.
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
      patchNotifications.isError &&
      patchNotifications.error instanceof ApiError &&
      patchNotifications.error.status !== 403 ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 rounded-lg border px-4 py-3 text-sm text-red-950 dark:text-red-100"
        >
          <span className="font-medium">{patchNotifications.error.message}</span>
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
