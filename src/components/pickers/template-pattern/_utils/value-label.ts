export function valueLabel(value: number | string | null): string {
  return value === null ? "null" : String(value);
}
