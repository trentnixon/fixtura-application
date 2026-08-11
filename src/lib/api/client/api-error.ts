export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;
  /** Parsed from `Retry-After` when present (integer seconds; HTTP-date converted when possible). */
  readonly retryAfterSeconds: number | null;

  constructor({
    status,
    message,
    details,
    retryAfterSeconds = null,
  }: {
    status: number;
    message: string;
    details?: unknown;
    retryAfterSeconds?: number | null;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.retryAfterSeconds = retryAfterSeconds ?? null;
  }
}
