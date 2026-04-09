import type { InitialPipelineStatus, OnboardingSetupStatusData } from "@/types/api/account";

const PIPELINE_STATUSES: ReadonlySet<string> = new Set([
  "not_started",
  "queued",
  "running",
  "completed",
  "failed",
]);

function parseOptionalPipeline(raw: unknown): InitialPipelineStatus | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw === "string" && PIPELINE_STATUSES.has(raw)) return raw as InitialPipelineStatus;
  return undefined;
}

/**
 * Normalizes Strapi/BFF JSON (with or without a `data` envelope) into S1 fields.
 */
export function parseOnboardingSetupStatusPayload(
  payload: unknown,
): OnboardingSetupStatusData | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const rawInner = root["data"];
  const inner =
    rawInner !== undefined && typeof rawInner === "object" && rawInner !== null
      ? (rawInner as Record<string, unknown>)
      : root;
  const status = inner["status"];
  if (typeof status !== "string" || !status.trim()) return null;

  const result: OnboardingSetupStatusData = {
    status: status.trim(),
  };

  const phase = inner["phase"];
  if (typeof phase === "string") result.phase = phase;
  else if (phase === null) result.phase = null;

  const requiresUserAction = inner["requiresUserAction"];
  if (typeof requiresUserAction === "boolean") result.requiresUserAction = requiresUserAction;

  const errorCode = inner["errorCode"];
  if (typeof errorCode === "string") result.errorCode = errorCode;
  else if (errorCode === null) result.errorCode = null;

  const progress = inner["progress"];
  if (progress !== undefined) {
    result.progress = progress as number | string | Record<string, unknown> | null;
  }

  const messageKey = inner["messageKey"];
  if (typeof messageKey === "string") result.messageKey = messageKey;
  else if (messageKey === null) result.messageKey = null;

  const initialSetup = parseOptionalPipeline(inner["initialSetupStatus"]);
  if (initialSetup !== undefined) result.initialSetupStatus = initialSetup;

  const initialFetch = parseOptionalPipeline(inner["initialDataFetchStatus"]);
  if (initialFetch !== undefined) result.initialDataFetchStatus = initialFetch;

  const isSetup = inner["isSetup"];
  if (typeof isSetup === "boolean") result.isSetup = isSetup;

  const isUpdating = inner["isUpdating"];
  if (typeof isUpdating === "boolean") result.isUpdating = isUpdating;

  return result;
}
