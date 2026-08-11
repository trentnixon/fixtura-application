import {
  TypographyDataLabel,
  TypographyDataValue,
  TypographyOverline,
} from "@/components/typography";

import type {
  BillingDebugPanelBoolRowProps,
  BillingDebugPanelRowProps,
  BillingDebugPanelSectionTitleProps,
} from "../../_types/debug/billingDebugPanelRows";

export function BillingDebugPanelRow({ label, value, valueClassName }: BillingDebugPanelRowProps) {
  return (
    <div className="flex min-w-0 items-baseline gap-3 border-b border-emerald-500/25 py-1">
      <TypographyDataLabel as="span" className="max-w-[58%] min-w-0 shrink-0 text-emerald-600">
        {label}
      </TypographyDataLabel>
      <TypographyDataValue
        as="span"
        className={`min-w-0 flex-1 text-right break-all ${valueClassName ?? "text-emerald-200"}`}
      >
        {value}
      </TypographyDataValue>
    </div>
  );
}

export function BillingDebugPanelBoolRow({ label, value }: BillingDebugPanelBoolRowProps) {
  return (
    <BillingDebugPanelRow
      label={label}
      value={value ? "true" : "false"}
      valueClassName={
        value
          ? "font-semibold text-green-400 dark:text-green-300"
          : "font-semibold text-red-500 dark:text-red-400"
      }
    />
  );
}

export function BillingDebugPanelSectionTitle({ children }: BillingDebugPanelSectionTitleProps) {
  return (
    <TypographyOverline as="p" className="mb-1 text-[10px] text-emerald-500">
      {children}
    </TypographyOverline>
  );
}
