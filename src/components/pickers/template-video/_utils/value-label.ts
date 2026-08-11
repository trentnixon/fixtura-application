export function valueLabel(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined) return "null";
  return String(value);
}
