import { type ReactNode } from "react";

export type AccountDefinitionRowProps = {
  label: string;
  value: ReactNode;
};

export type AccountYesNoBadgeProps = {
  value: boolean | null | undefined;
};

export type AccountSectionShellTone = "brand" | "slate";

export type AccountSectionShellStyle = {
  headerClassName: string;
  iconClassName: string;
  descriptionClassName: string;
};

export type AccountSectionShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  headerTone?: AccountSectionShellTone;
  children: ReactNode;
};
