import type { AccountRenderListRow } from "@/types/api/account";

/** Client-side search on the current page (id or render name). */
export function filterBundlesRendersBySearch(
  renders: AccountRenderListRow[],
  search: string,
): AccountRenderListRow[] {
  const query = search.trim().toLowerCase();
  if (!query) return renders;
  return renders.filter((render) => {
    if (String(render.id).includes(query)) return true;
    return render.Name.toLowerCase().includes(query);
  });
}
