import { Badge } from "@/components/ui/badge";

import { ACCOUNT_EMPTY_VALUE_LABEL } from "../_constants/account-display-primitives";

import type { AccountYesNoBadgeProps } from "../_types/account-display-primitives";

export function AccountYesNoBadge({ value }: AccountYesNoBadgeProps) {
  const on = value === true;
  const label = value === true ? "Yes" : value === false ? "No" : ACCOUNT_EMPTY_VALUE_LABEL;

  return (
    <Badge variant={on ? "default" : "secondary"} className="font-normal">
      {label}
    </Badge>
  );
}
