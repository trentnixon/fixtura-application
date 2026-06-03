import { renderStatusDisplay } from "../_utils/render-status-display";

import type { AccountRenderListStatus } from "@/types/api/account";

export function BundlesRenderStatusPill({ status }: { status: AccountRenderListStatus }) {
  const display = renderStatusDisplay(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${display.pillClassName}`}
    >
      {display.label}
    </span>
  );
}
