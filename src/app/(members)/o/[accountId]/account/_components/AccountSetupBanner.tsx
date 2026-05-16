import Link from "next/link";

import { ACCOUNT_OVERVIEW_SETUP_BANNER } from "../_constants/account-overview";

export function AccountSetupBanner() {
  return (
    <div className="bg-muted/50 text-muted-foreground mt-2 rounded-lg border px-4 py-3 text-sm">
      {ACCOUNT_OVERVIEW_SETUP_BANNER.message}{" "}
      <Link
        href={ACCOUNT_OVERVIEW_SETUP_BANNER.primaryLink.href}
        className="text-foreground hover:text-foreground font-medium underline underline-offset-4"
      >
        {ACCOUNT_OVERVIEW_SETUP_BANNER.primaryLink.label}
      </Link>{" "}
      or{" "}
      <Link
        href={ACCOUNT_OVERVIEW_SETUP_BANNER.secondaryLink.href}
        className="text-foreground hover:text-foreground font-medium underline underline-offset-4"
      >
        {ACCOUNT_OVERVIEW_SETUP_BANNER.secondaryLink.label}
      </Link>
      .
    </div>
  );
}
