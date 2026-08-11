function firstParam(value: string | string[] | undefined): string {
  if (value === undefined) return "default";
  if (Array.isArray(value)) return value[0] ?? "default";
  return value || "default";
}

export function getScenario(searchParams: Record<string, string | string[] | undefined>) {
  return {
    state: firstParam(searchParams["state"]),
    mode: firstParam(searchParams["mode"]),
  };
}
