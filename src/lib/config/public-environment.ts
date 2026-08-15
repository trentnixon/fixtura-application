/**
 * Deployed environment label (client). From `NEXT_PUBLIC_ENVIRONMENT`.
 */
export function getPublicEnvironment(): string | null {
  const raw = process.env["NEXT_PUBLIC_ENVIRONMENT"];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

export function isProductionEnvironment(environment: string): boolean {
  return environment.toLowerCase() === "production";
}

/** Sidebar footer label for the current environment. */
export function getAppSidebarEnvironmentLabel(
  environment: string,
  year: number = new Date().getFullYear(),
): string {
  if (isProductionEnvironment(environment)) {
    return `Fixtura V.1 ${year}`;
  }

  return environment;
}
