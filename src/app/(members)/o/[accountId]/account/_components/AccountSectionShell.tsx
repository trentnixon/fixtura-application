import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import {
  ACCOUNT_SECTION_SHELL_HEADER_CLASS_NAME,
  ACCOUNT_SECTION_SHELL_STYLES,
  ACCOUNT_SECTION_SHELL_TITLE_CLASS_NAME,
} from "../_constants/account-display-primitives";

import type { AccountSectionShellProps } from "../_types/account-display-primitives";

export function AccountSectionShell({
  title,
  description,
  icon,
  headerTone,
  children,
}: AccountSectionShellProps) {
  const tone = headerTone ?? "brand";
  const toneStyles = ACCOUNT_SECTION_SHELL_STYLES[tone];

  return (
    <Surface className="overflow-hidden p-0">
      <div className={cn(ACCOUNT_SECTION_SHELL_HEADER_CLASS_NAME, toneStyles.headerClassName)}>
        <span className={cn("mt-0.5 shrink-0", toneStyles.iconClassName)}>{icon}</span>
        <div>
          <p className={ACCOUNT_SECTION_SHELL_TITLE_CLASS_NAME}>{title}</p>
          <p className={cn("mt-2 text-sm leading-relaxed", toneStyles.descriptionClassName)}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </Surface>
  );
}
