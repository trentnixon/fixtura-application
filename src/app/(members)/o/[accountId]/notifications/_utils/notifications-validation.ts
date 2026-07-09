import { z } from "zod";

import { NOTIFICATIONS_DELIVERY_EMAIL_INVALID_ERROR } from "../_constants/notifications-form";

const deliveryEmailSchema = z.string().email();

export function validateNotificationsDeliveryEmailValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      error: null,
      value: null as string | null,
    };
  }

  const normalized = trimmed.toLowerCase();
  const parsed = deliveryEmailSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      error: NOTIFICATIONS_DELIVERY_EMAIL_INVALID_ERROR,
      value: null as string | null,
    };
  }

  return {
    error: null,
    value: parsed.data,
  };
}
