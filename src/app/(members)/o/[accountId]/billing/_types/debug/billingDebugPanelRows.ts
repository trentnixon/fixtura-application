import type { ReactNode } from "react";

export type BillingDebugPanelRowProps = {
  label: string;
  value: string;
  /** Tailwind classes for the value column (defaults to emerald for non-boolean rows). */
  valueClassName?: string;
};

export type BillingDebugPanelBoolRowProps = {
  label: string;
  value: boolean;
};

export type BillingDebugPanelSectionTitleProps = {
  children: ReactNode;
};
