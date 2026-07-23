"use client";

import { usePathname } from "next/navigation";

import { InlineAlert } from "@/components/auth/actions";
import { useOnboardingOnboardingState } from "@/lib/api/hooks/account/useOnboardingOnboardingState";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { resolveAccountEntry } from "@/lib/onboarding/resolve-account-entry";

/**
 * When the user is inside `/o/[accountId]/…`, shows background setup status while `isSetup` is false.
 * Pipeline failures use a stronger alert; routing is not blocked (see resolveAccountEntry).
 */
export function ScopedOnboardingSyncBanner() {
  const pathname = usePathname();
  const scoped = pathname ? parseAccountScopePath(pathname) : null;
  const accountId = scoped?.accountId ?? "";
  const q = useOnboardingOnboardingState(accountId, { enabled: Boolean(accountId) });

  if (!accountId || !q.isSuccess || !q.data) return null;
  const state = q.data;
  if (resolveAccountEntry(state) !== "dashboard") return null;
  if (state.isSetup === true) return null;

  const pipelineFailed =
    state.initialSetupStatus === "failed" || state.initialDataFetchStatus === "failed";

  if (pipelineFailed) {
    return (
      <div className="border-border w-full border-t px-4 pb-3 lg:px-6">
        <InlineAlert
          variant="destructive"
          message="Initial setup or data fetch failed. Please contact us if this continues."
        />
      </div>
    );
  }

  return (
    <div className="border-border w-full border-t px-4 pb-3 lg:px-6">
      <InlineAlert
        variant="info"
        message="We are still preparing your organisation in the background. Some features may update when setup finishes."
      />
    </div>
  );
}
