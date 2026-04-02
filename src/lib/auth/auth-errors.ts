/**
 * Canonical user-facing strings for auth, API errors, and related flows.
 * Aligned with `.comms/4-MEMBERS-AREA-ERROR-AND-MESSAGING.md`.
 */
export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Incorrect email or password. Please try again.",
  /** Login / Strapi unavailable or misconfigured */
  loginUnavailable: "We're unable to sign you in right now. Please try again.",
  sessionExpired: "Your session has expired. Please sign in again.",
  unauthorized: "You need to sign in to continue.",
  forbidden: "You don't have permission to access this page.",
  network: "Something went wrong. Please check your connection and try again.",
  unexpected: "Something went wrong. Please try again.",
  /** HTTP 5xx from APIs (do not surface raw server text) */
  serverError: "We're having trouble right now. Please try again shortly.",
  loggedOut: "You've been signed out.",
  /** Forgot password recovery failure */
  forgotPasswordFailed: "We couldn't process your request. Please try again.",
  /** Reset password token/flow failure */
  resetPasswordFailed: "The reset link is invalid or has expired.",
  /** Session boundary when `/api/auth/session` fails */
  sessionVerifyTitle: "Could not verify session",
} as const;
