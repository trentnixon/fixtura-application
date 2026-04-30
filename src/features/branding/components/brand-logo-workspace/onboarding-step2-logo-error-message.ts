import { ApiError } from "@/lib/api/client/api-error";

/** Known W2/M1 Strapi codes from onboarding step-2 (see `.comms/responses/brand-logo-cms-fed-briefing.md`). */
const STEP2_LOGO_CODE_MESSAGES: Record<string, string> = {
  ORGANISATION_REQUIRED:
    "Your organisation profile must be linked before the logo can be updated. Contact support if this persists.",
  INVALID_LOGO_MIME: "That file type is not supported. Use PNG, JPEG, or WebP.",
  UNKNOWN_MEDIA: "The uploaded file could not be processed. Try another image.",
  EMPTY_UPDATE: "Nothing to save. Try uploading or cropping again.",
  INVALID_BODY: "The request could not be processed. Refresh the page and try again.",
};

function messageFromDetails(details: unknown): string | undefined {
  if (typeof details !== "object" || details === null) return undefined;
  const rec = details as Record<string, unknown>;

  const nested = rec["error"];
  if (typeof nested === "object" && nested !== null) {
    const err = nested as { code?: unknown; message?: unknown };
    const code = typeof err.code === "string" ? err.code : undefined;
    if (code && STEP2_LOGO_CODE_MESSAGES[code]) return STEP2_LOGO_CODE_MESSAGES[code];
    if (typeof err.message === "string" && err.message.trim()) return err.message.trim();
  }

  const code = typeof rec["code"] === "string" ? rec["code"] : undefined;
  if (code && STEP2_LOGO_CODE_MESSAGES[code]) return STEP2_LOGO_CODE_MESSAGES[code];

  const msg = typeof rec["message"] === "string" ? rec["message"].trim() : "";
  if (msg) return msg;

  return undefined;
}

/** User-facing message for logo upload / step-2 PATCH failures. */
export function onboardingStep2LogoErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const fromDetails = messageFromDetails(error.details);
    if (fromDetails) return fromDetails;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not update your logo. Try again.";
}
