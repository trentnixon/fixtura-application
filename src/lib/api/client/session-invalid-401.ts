/**
 * Auth routes where HTTP 401 means invalid credentials (or similar), not an expired session.
 * The fetch client must not run the global sign-out redirect for these paths.
 */
const CREDENTIAL_FAILURE_401_PATHS = new Set(["/api/auth/login"]);

export function shouldHandle401AsSessionInvalid(requestPath: string): boolean {
  const pathname = requestPath.split("?")[0] ?? requestPath;
  return !CREDENTIAL_FAILURE_401_PATHS.has(pathname);
}
