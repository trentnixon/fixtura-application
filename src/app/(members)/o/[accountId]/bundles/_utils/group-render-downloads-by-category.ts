import type { AccountRenderDetailDownload } from "@/types/api/account";

export type BundlesRenderDownloadGroup = {
  groupingCategory: string;
  assetCount: number;
  /** First direct URL in the group when hub URL cannot be built. */
  fallbackUrl: string | null;
};

/** One row per `grouping_category`, sorted for display (01, 02, 03…). */
export function groupRenderDownloadsByCategory(
  downloads: AccountRenderDetailDownload[],
): BundlesRenderDownloadGroup[] {
  const byCategory = new Map<string, { assetCount: number; fallbackUrl: string | null }>();

  for (const download of downloads) {
    const category = download.grouping_category?.trim();
    if (!category) continue;

    const url = download.URL?.trim() || null;
    const existing = byCategory.get(category);

    if (existing) {
      existing.assetCount += 1;
      if (!existing.fallbackUrl && url) existing.fallbackUrl = url;
    } else {
      byCategory.set(category, { assetCount: 1, fallbackUrl: url });
    }
  }

  return Array.from(byCategory.entries())
    .map(([groupingCategory, { assetCount, fallbackUrl }]) => ({
      groupingCategory,
      assetCount,
      fallbackUrl,
    }))
    .sort((a, b) =>
      a.groupingCategory.localeCompare(b.groupingCategory, undefined, { numeric: true }),
    );
}
