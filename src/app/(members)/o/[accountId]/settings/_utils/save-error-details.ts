/** Read Strapi/CMS `{ error: { code } }` from normalized ApiError.details. */
export function strapiStructuredErrorCode(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const top = details as Record<string, unknown>;
  const err = top["error"];
  if (err !== null && typeof err === "object") {
    const code = (err as Record<string, unknown>)["code"];
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export function extraDetailForSaveError(code: string | undefined): string | undefined {
  if (code === "EMPTY_UPDATE") {
    return "Nothing applied after filtering by organisation type, or fields matched the server.";
  }
  if (code === "SCHEDULER_MISSING") {
    return "Delivery could not be saved because no scheduler exists for this account yet.";
  }
  return undefined;
}
