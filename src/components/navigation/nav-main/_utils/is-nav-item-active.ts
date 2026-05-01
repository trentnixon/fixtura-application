export function isNavItemActive(pathname: string, itemUrl: string) {
  if (itemUrl === "/") return pathname === "/";
  return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`) || pathname.startsWith(itemUrl);
}
