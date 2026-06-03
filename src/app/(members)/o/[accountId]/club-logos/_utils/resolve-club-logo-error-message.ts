import { ApiError } from "@/lib/api/client/api-error";

/** Strapi write codes for club logo M1/W2 — see `.comms/data-fetching/handoff/cms-handoff-club-logos-fe.md`. */
const CLUB_LOGO_CODE_MESSAGES: Record<string, string> = {
  EMPTY_UPDATE: "Nothing to save. Try uploading or cropping again.",
  UNKNOWN_MEDIA: "The uploaded file could not be processed. Try another image.",
  INVALID_LOGO_MIME: "That file type is not supported. Use PNG, JPEG, or WebP.",
  INVALID_LOGO_MEDIA_ID: "The uploaded file reference is invalid. Try uploading again.",
  INVALID_BODY: "The request could not be processed. Refresh the page and try again.",
  ACCOUNT_NOT_FOUND: "This account could not be found or you do not have access.",
  CLUB_NOT_FOUND: "This club is not in your association directory or may have been removed.",
};

function messageFromDetails(details: unknown): string | undefined {
  if (typeof details !== "object" || details === null) return undefined;
  const rec = details as Record<string, unknown>;

  const nested = rec["error"];
  if (typeof nested === "object" && nested !== null) {
    const err = nested as { code?: unknown; message?: unknown };
    const code = typeof err.code === "string" ? err.code : undefined;
    if (code && CLUB_LOGO_CODE_MESSAGES[code]) return CLUB_LOGO_CODE_MESSAGES[code];
    if (typeof err.message === "string" && err.message.trim()) return err.message.trim();
  }

  const code = typeof rec["code"] === "string" ? rec["code"] : undefined;
  if (code && CLUB_LOGO_CODE_MESSAGES[code]) return CLUB_LOGO_CODE_MESSAGES[code];

  const msg = typeof rec["message"] === "string" ? rec["message"].trim() : "";
  if (msg) return msg;

  return undefined;
}

/** User-facing message for club logo upload / PATCH failures. */
export function resolveClubLogoErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const fromDetails = messageFromDetails(error.details);
    if (fromDetails) return fromDetails;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not update this club logo. Try again.";
}
