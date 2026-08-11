import type { AccountMediaLibraryFieldErrors } from "@/types/api/account";

export type ParsedMediaLibraryApiError = {
  message: string;
  code: string | null;
  fieldErrors: AccountMediaLibraryFieldErrors;
};

export function parseMediaLibraryApiError(details: unknown): ParsedMediaLibraryApiError {
  if (typeof details !== "object" || details === null) {
    return { message: "Something went wrong. Please try again.", code: null, fieldErrors: {} };
  }

  const record = details as Record<string, unknown>;
  const errorObj = record["error"];

  if (typeof errorObj !== "object" || errorObj === null) {
    const fallback =
      typeof record["message"] === "string"
        ? record["message"]
        : typeof record["error"] === "string"
          ? record["error"]
          : "Something went wrong. Please try again.";
    return { message: fallback, code: null, fieldErrors: {} };
  }

  const err = errorObj as Record<string, unknown>;
  const message =
    typeof err["message"] === "string" ? err["message"] : "Something went wrong. Please try again.";
  const code = typeof err["code"] === "string" ? err["code"] : null;

  const detailsObj = err["details"];
  let fieldErrors: AccountMediaLibraryFieldErrors = {};
  if (typeof detailsObj === "object" && detailsObj !== null) {
    const fields = (detailsObj as Record<string, unknown>)["fields"];
    if (typeof fields === "object" && fields !== null) {
      fieldErrors = fields as AccountMediaLibraryFieldErrors;
    }
  }

  if (code === "FILE_TOO_LARGE") {
    return {
      message: "That image is too large. Use a file under 15 MB.",
      code,
      fieldErrors,
    };
  }

  if (code === "UNSUPPORTED_MEDIA_TYPE") {
    return {
      message: "Unsupported file type. Use JPEG, PNG, or WebP.",
      code,
      fieldErrors,
    };
  }

  const assetTypeConflict =
    code === "ASSET_TYPES_REQUIRE_CURRENT_CLIENT" ||
    Object.values(fieldErrors).some((messages) =>
      messages.some((entry) => entry.includes("ASSET_TYPES_REQUIRE_CURRENT_CLIENT")),
    );

  if (assetTypeConflict) {
    return {
      message: "This background uses newer multi-assignment data. Refresh the page and try again.",
      code: code ?? "ASSET_TYPES_REQUIRE_CURRENT_CLIENT",
      fieldErrors,
    };
  }

  return { message, code, fieldErrors };
}
