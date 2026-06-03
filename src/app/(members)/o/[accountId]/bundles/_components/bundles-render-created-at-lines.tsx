import {
  formatRenderCreatedDate,
  formatRenderCreatedTime,
} from "../_utils/format-render-created-at";

/** List/detail pattern — bold date, muted time on the next line. */
export function BundlesRenderCreatedAtLines({ iso }: { iso: string }) {
  return (
    <span className="inline-flex flex-col whitespace-nowrap">
      <span className="text-foreground font-semibold">{formatRenderCreatedDate(iso)}</span>
      <span className="text-muted-foreground text-xs font-medium tabular-nums">
        {formatRenderCreatedTime(iso)}
      </span>
    </span>
  );
}
