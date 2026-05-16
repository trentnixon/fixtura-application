import type {
  AccountSectionShellStyle,
  AccountSectionShellTone,
} from "../_types/account-display-primitives";

export const ACCOUNT_EMPTY_VALUE_LABEL = "\u2014";
export const ACCOUNT_SECTION_SHELL_HEADER_CLASS_NAME =
  "flex w-full items-start gap-3 border-b px-6 py-5";
export const ACCOUNT_SECTION_SHELL_TITLE_CLASS_NAME =
  "text-xl leading-none font-semibold text-white";

export const ACCOUNT_SECTION_SHELL_STYLES: Record<
  AccountSectionShellTone,
  AccountSectionShellStyle
> = {
  brand: {
    headerClassName: "bg-primary-950 border-white/15 text-white",
    iconClassName: "text-white/90",
    descriptionClassName: "text-white/80",
  },
  slate: {
    headerClassName: "bg-slate-900 border-slate-800/80 text-white",
    iconClassName: "text-slate-400",
    descriptionClassName: "text-slate-400",
  },
};
