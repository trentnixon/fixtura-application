import { LOGIN_REASON_CONTINUE } from "@/lib/config/gateway-reasons";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";

/**
 * Sets `from` (and `reason` when appropriate) on a sign-in URL for unauthenticated access to protected members routes.
 */
export function applySignInRedirectQuery(url: URL, pathname: string, search: string): void {
  const fullPath = pathname + search;
  const fromValue = isSafeAppReturnPath(fullPath)
    ? fullPath
    : isSafeAppReturnPath(pathname)
      ? pathname
      : ROUTES.selectOrganisation;
  url.searchParams.set("from", fromValue);
  if (isSafeAppReturnPath(fromValue)) {
    url.searchParams.set("reason", LOGIN_REASON_CONTINUE);
  }
}
