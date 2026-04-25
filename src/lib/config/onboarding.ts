/**
 * Strapi `account-type` id for **club** vs **association** in onboarding / account payloads.
 * Backend resolves `accountOrganisationDetails` from `clubs[0]` when `account_type.id === 1`, else `associations[0]`.
 * @see create-organisation/.comms/phase-2/cms-phase2-backend-signoff.md
 */
export const CLUB_ACCOUNT_TYPE_ID = 1;

/**
 * S2 — default client poll interval (ms) while onboarding setup status is non-terminal.
 * @see create-organisation/.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md
 */
export const ONBOARDING_SETUP_STATUS_POLL_MS = 5000;

/**
 * S1 — setup-status can lag while downstream setup/data-fetch jobs settle, so allow longer than
 * the generic client timeout before surfacing a transient timeout to the UI.
 */
export const ONBOARDING_SETUP_STATUS_TIMEOUT_MS = 45000;

/**
 * Returns true when polling should stop (terminal states).
 * Lifecycle v1 CMS emits `ready` and `failed`; older docs also listed `blocked` / `abandoned` — kept for compatibility.
 */
export function isTerminalOnboardingSetupStatus(status: string | null | undefined): boolean {
  if (!status || typeof status !== "string") return false;
  const s = status.trim().toLowerCase();
  return s === "ready" || s === "failed" || s === "blocked" || s === "abandoned";
}
