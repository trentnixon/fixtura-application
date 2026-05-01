import { ROUTES } from "@/lib/config/routes";

export function isSandboxActive(pathname: string) {
  return (
    pathname === ROUTES.sandbox ||
    pathname.startsWith(`${ROUTES.sandbox}/`) ||
    pathname.startsWith(ROUTES.sandbox)
  );
}
