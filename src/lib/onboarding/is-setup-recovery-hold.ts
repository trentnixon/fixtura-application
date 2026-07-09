/** True when S1 setup status is terminal `failed` (case-insensitive). */
export function isSetupStatusFailed(status: string | null | undefined): boolean {
  return status?.trim().toLowerCase() === "failed";
}

type HoldSetupRecoveryPageInput = {
  setupPending: boolean;
  setupFailed: boolean;
};

/**
 * Hold `/create-organisation/setup` until setup status settles, or when failed so retry is reachable.
 */
export function shouldHoldSetupRecoveryPage({
  setupPending,
  setupFailed,
}: HoldSetupRecoveryPageInput): boolean {
  return setupPending || setupFailed;
}
