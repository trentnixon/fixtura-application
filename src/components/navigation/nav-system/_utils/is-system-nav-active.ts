import { NAV_SYSTEM_ACTIVE_PATH_PREFIX } from "../_constants/nav-system-ui";

export function isSystemNavActive(pathname: string): boolean {
  return pathname.startsWith(NAV_SYSTEM_ACTIVE_PATH_PREFIX);
}
