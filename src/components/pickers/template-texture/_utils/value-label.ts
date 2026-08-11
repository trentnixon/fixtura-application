export function valueLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "null";
  return String(value);
}
