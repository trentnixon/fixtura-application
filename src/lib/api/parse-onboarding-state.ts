import type {
  InitialPipelineStatus,
  OnboardingStateData,
  OnboardingWizardStatus,
} from "@/types/api/account";

const WIZARD_STATUSES: ReadonlySet<string> = new Set(["not_started", "in_progress", "completed"]);

const PIPELINE_STATUSES: ReadonlySet<string> = new Set([
  "not_started",
  "queued",
  "running",
  "completed",
  "failed",
]);

function parseWizardStatus(raw: unknown): OnboardingWizardStatus | null {
  if (typeof raw !== "string" || !WIZARD_STATUSES.has(raw)) return null;
  return raw as OnboardingWizardStatus;
}

function parsePipelineStatus(raw: unknown): InitialPipelineStatus | null {
  if (typeof raw !== "string" || !PIPELINE_STATUSES.has(raw)) return null;
  return raw as InitialPipelineStatus;
}

function parseOptionalIsoString(raw: unknown): string | null {
  if (raw === null) return null;
  if (typeof raw === "string" && raw.trim()) return raw;
  return null;
}

function parseOptionalString(raw: unknown): string | null {
  if (raw === null) return null;
  if (typeof raw === "string") return raw;
  return null;
}

/**
 * Normalizes Strapi/BFF JSON (with or without a `data` envelope) into lifecycle v1 fields.
 */
export function parseOnboardingStatePayload(payload: unknown): OnboardingStateData | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const rawInner = root["data"];
  const inner =
    rawInner !== undefined && typeof rawInner === "object" && rawInner !== null
      ? (rawInner as Record<string, unknown>)
      : root;

  const rawAccountId = inner["accountId"];
  const accountId =
    typeof rawAccountId === "number" && Number.isFinite(rawAccountId)
      ? rawAccountId
      : typeof rawAccountId === "string" && /^\d+$/.test(rawAccountId.trim())
        ? Number(rawAccountId)
        : NaN;
  if (!Number.isFinite(accountId)) return null;

  const onboardingWizardStatus = parseWizardStatus(inner["onboardingWizardStatus"]);
  if (!onboardingWizardStatus) return null;

  const onboardingCurrentStep = inner["onboardingCurrentStep"];
  const onboardingLastCompletedStep = inner["onboardingLastCompletedStep"];
  if (typeof onboardingCurrentStep !== "number" || !Number.isFinite(onboardingCurrentStep)) {
    return null;
  }
  if (
    typeof onboardingLastCompletedStep !== "number" ||
    !Number.isFinite(onboardingLastCompletedStep)
  ) {
    return null;
  }

  const initialSetupStatus = parsePipelineStatus(inner["initialSetupStatus"]);
  const initialDataFetchStatus = parsePipelineStatus(inner["initialDataFetchStatus"]);
  if (!initialSetupStatus || !initialDataFetchStatus) return null;

  const hasCompletedOnboardingWizard = inner["hasCompletedOnboardingWizard"];
  if (typeof hasCompletedOnboardingWizard !== "boolean") return null;

  const isSetup = inner["isSetup"];
  const isUpdating = inner["isUpdating"];
  const isActive = inner["isActive"];
  if (
    typeof isSetup !== "boolean" ||
    typeof isUpdating !== "boolean" ||
    typeof isActive !== "boolean"
  ) {
    return null;
  }

  return {
    accountId,
    onboardingWizardStatus,
    onboardingCurrentStep,
    onboardingLastCompletedStep,
    onboardingStartedAt: parseOptionalIsoString(inner["onboardingStartedAt"]),
    onboardingLastActivityAt: parseOptionalIsoString(inner["onboardingLastActivityAt"]),
    hasCompletedOnboardingWizard,
    onboardingWizardCompletedAt: parseOptionalIsoString(inner["onboardingWizardCompletedAt"]),
    initialSetupStatus,
    initialSetupStartedAt: parseOptionalIsoString(inner["initialSetupStartedAt"]),
    initialSetupCompletedAt: parseOptionalIsoString(inner["initialSetupCompletedAt"]),
    initialSetupFailedAt: parseOptionalIsoString(inner["initialSetupFailedAt"]),
    initialSetupFailureReason: parseOptionalString(inner["initialSetupFailureReason"]),
    initialDataFetchStatus,
    initialDataFetchStartedAt: parseOptionalIsoString(inner["initialDataFetchStartedAt"]),
    initialDataFetchCompletedAt: parseOptionalIsoString(inner["initialDataFetchCompletedAt"]),
    initialDataFetchFailedAt: parseOptionalIsoString(inner["initialDataFetchFailedAt"]),
    initialDataFetchFailureReason: parseOptionalString(inner["initialDataFetchFailureReason"]),
    isSetup,
    isUpdating,
    isActive,
  };
}
