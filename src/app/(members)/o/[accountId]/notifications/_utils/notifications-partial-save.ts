import { ApiError } from "@/lib/api/client/api-error";

import {
  NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY,
  NOTIFICATIONS_PARTIAL_SAVE_DAY_ONLY,
  NOTIFICATIONS_SAVE_FAILED,
  NOTIFICATIONS_SAVE_SUCCESS,
} from "../_constants/notifications-form";

import type { NotificationsProfileDraft } from "@/features/notifications/bundle-delivery-profile-shared";

export type NotificationsSaveFieldOutcome = "skipped" | "saved" | "failed";

export type NotificationsSaveOutcome = {
  contact: NotificationsSaveFieldOutcome;
  deliveryDay: NotificationsSaveFieldOutcome;
  contactError: ApiError | null;
  deliveryDayError: ApiError | null;
};

type MutateAsync<T> = (body: T) => Promise<unknown>;

export async function runNotificationsSave(args: {
  contactPatch: Record<string, unknown> | null;
  deliveryDayPatch: Record<string, unknown> | null;
  patchContact: MutateAsync<Record<string, unknown>>;
  patchDeliveryDay: MutateAsync<Record<string, unknown>>;
}): Promise<NotificationsSaveOutcome> {
  const outcome: NotificationsSaveOutcome = {
    contact: args.contactPatch ? "failed" : "skipped",
    deliveryDay: args.deliveryDayPatch ? "failed" : "skipped",
    contactError: null,
    deliveryDayError: null,
  };

  if (args.contactPatch) {
    try {
      await args.patchContact(args.contactPatch);
      outcome.contact = "saved";
    } catch (e) {
      outcome.contact = "failed";
      outcome.contactError = e instanceof ApiError ? e : null;
    }
  }

  if (args.deliveryDayPatch) {
    try {
      await args.patchDeliveryDay(args.deliveryDayPatch);
      outcome.deliveryDay = "saved";
    } catch (e) {
      outcome.deliveryDay = "failed";
      outcome.deliveryDayError = e instanceof ApiError ? e : null;
    }
  }

  return outcome;
}

export function isNotificationsSaveFullySuccessful(outcome: NotificationsSaveOutcome): boolean {
  const contactOk = outcome.contact === "skipped" || outcome.contact === "saved";
  const dayOk = outcome.deliveryDay === "skipped" || outcome.deliveryDay === "saved";
  return contactOk && dayOk && outcome.contact !== "failed" && outcome.deliveryDay !== "failed";
}

export function isNotificationsSavePartiallySuccessful(outcome: NotificationsSaveOutcome): boolean {
  const contactSaved = outcome.contact === "saved";
  const daySaved = outcome.deliveryDay === "saved";
  const contactFailed = outcome.contact === "failed";
  const dayFailed = outcome.deliveryDay === "failed";
  return (contactSaved && dayFailed) || (daySaved && contactFailed);
}

export function isNotificationsSaveFullyFailed(outcome: NotificationsSaveOutcome): boolean {
  if (isNotificationsSaveFullySuccessful(outcome)) return false;
  if (isNotificationsSavePartiallySuccessful(outcome)) return false;
  return outcome.contact === "failed" || outcome.deliveryDay === "failed";
}

export function getNotificationsSaveUserMessage(outcome: NotificationsSaveOutcome): {
  toast: "success" | "error" | null;
  alert: string | null;
} {
  if (isNotificationsSaveFullySuccessful(outcome)) {
    return { toast: "success", alert: null };
  }

  if (outcome.contact === "saved" && outcome.deliveryDay === "failed") {
    return { toast: "error", alert: NOTIFICATIONS_PARTIAL_SAVE_CONTACT_ONLY };
  }

  if (outcome.deliveryDay === "saved" && outcome.contact === "failed") {
    return { toast: "error", alert: NOTIFICATIONS_PARTIAL_SAVE_DAY_ONLY };
  }

  if (isNotificationsSaveFullyFailed(outcome)) {
    return { toast: "error", alert: NOTIFICATIONS_SAVE_FAILED };
  }

  return { toast: null, alert: null };
}

export function getNotificationsSaveSuccessMessage(): string {
  return NOTIFICATIONS_SAVE_SUCCESS;
}

export function applyPartialSaveToSavedDraft(
  savedDraft: NotificationsProfileDraft,
  draft: NotificationsProfileDraft,
  outcome: NotificationsSaveOutcome,
): NotificationsProfileDraft {
  return {
    bundleAddressedTo:
      outcome.contact === "saved" ? draft.bundleAddressedTo : savedDraft.bundleAddressedTo,
    deliveryEmail: outcome.contact === "saved" ? draft.deliveryEmail : savedDraft.deliveryEmail,
    assetDeliveryDay:
      outcome.deliveryDay === "saved" ? draft.assetDeliveryDay : savedDraft.assetDeliveryDay,
  };
}
