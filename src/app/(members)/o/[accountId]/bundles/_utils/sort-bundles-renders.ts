import type { AccountRenderListRow } from "@/types/api/account";

export type BundlesRenderSortColumn = "createdAt" | "status";
export type BundlesRenderSortDirection = "asc" | "desc";

export function sortBundlesRenders(
  renders: AccountRenderListRow[],
  column: BundlesRenderSortColumn,
  direction: BundlesRenderSortDirection,
): AccountRenderListRow[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...renders].sort((a, b) => {
    if (column === "createdAt") {
      return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * factor;
    }
    return a.status.localeCompare(b.status) * factor;
  });
}

export function nextBundlesRenderSort(
  current: { column: BundlesRenderSortColumn; direction: BundlesRenderSortDirection },
  column: BundlesRenderSortColumn,
): { column: BundlesRenderSortColumn; direction: BundlesRenderSortDirection } {
  if (current.column !== column) {
    return {
      column,
      direction: column === "createdAt" ? "desc" : "asc",
    };
  }
  return {
    column,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}
