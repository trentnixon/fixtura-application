const NAV_USER_INITIALS_FALLBACK = "FX";

export function getNavUserInitials(displayName: string): string {
  return (
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || NAV_USER_INITIALS_FALLBACK
  );
}
