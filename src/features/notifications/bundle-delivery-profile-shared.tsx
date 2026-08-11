"use client";

import { type ReactNode } from "react";

import { TypographyMuted } from "@/components/typography";
import { Input } from "@/components/ui/input";
import {
  type WeekdayKey,
  WEEKDAY_OPTIONS,
  daysUntilNextDelivery,
  weekdayLabel,
} from "@/features/settings/bundle-delivery-weekdays";
import { cn } from "@/lib/utils";

export type NotificationsProfileDraft = {
  bundleAddressedTo: string;
  deliveryEmail: string;
  assetDeliveryDay: WeekdayKey;
};

export function notificationsFieldId(prefix: string, key: keyof NotificationsProfileDraft) {
  return `${prefix}-notifications-${key}`;
}

export function equalNotificationsDraft(
  a: NotificationsProfileDraft,
  b: NotificationsProfileDraft,
) {
  return (
    a.bundleAddressedTo === b.bundleAddressedTo &&
    a.deliveryEmail === b.deliveryEmail &&
    a.assetDeliveryDay === b.assetDeliveryDay
  );
}

type ChangeRow = { label: string; before: string; after: string };

export function collectNotificationsChanges(
  saved: NotificationsProfileDraft,
  next: NotificationsProfileDraft,
): ChangeRow[] {
  const out: ChangeRow[] = [];
  if (saved.bundleAddressedTo !== next.bundleAddressedTo) {
    out.push({
      label: "Bundle addressed to",
      before: saved.bundleAddressedTo,
      after: next.bundleAddressedTo,
    });
  }
  if (saved.deliveryEmail !== next.deliveryEmail) {
    out.push({
      label: "Delivery email",
      before: saved.deliveryEmail,
      after: next.deliveryEmail,
    });
  }
  if (saved.assetDeliveryDay !== next.assetDeliveryDay) {
    out.push({
      label: "Asset delivery day",
      before: weekdayLabel(saved.assetDeliveryDay),
      after: weekdayLabel(next.assetDeliveryDay),
    });
  }
  return out;
}

export function AccountSelectRow(props: {
  title: string;
  description: string;
  disabled: boolean;
  id: string;
  valueLabel: string;
  children: ReactNode;
}) {
  const { title, description, disabled, id, valueLabel, children } = props;

  return (
    <li className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <TypographyMuted className="hidden text-xs sm:block">{valueLabel}</TypographyMuted>
        <div className={cn("min-w-40", disabled ? "opacity-70" : "opacity-100")}>{children}</div>
      </div>
      <span id={id} className="sr-only" />
    </li>
  );
}

export function AccountInputRow(props: {
  title: string;
  description: string;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  id: string;
}) {
  const { title, description, disabled, value, onChange, type = "text", id } = props;

  return (
    <li className="border-border flex flex-col gap-3 border-b px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1 sm:max-w-[55%]">
        <div className="text-sm font-medium">{title}</div>
        <TypographyMuted className="text-xs">{description}</TypographyMuted>
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 max-w-md rounded-xl sm:shrink-0"
      />
    </li>
  );
}

export { WEEKDAY_OPTIONS, daysUntilNextDelivery, weekdayLabel };
export type { WeekdayKey };
