import { AccountSecurityContent } from "./AccountSecurityContent";

import type { AccountPageContentProps } from "../_types/page";

export function AccountPageContent({ accountId }: AccountPageContentProps) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <AccountSecurityContent accountId={accountId} />
    </div>
  );
}
