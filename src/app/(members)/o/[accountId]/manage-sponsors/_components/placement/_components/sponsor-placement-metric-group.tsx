import type { SponsorPlacementMetricGroupProps } from "../_types/sponsor-placement-metrics";

export function SponsorPlacementMetricGroup({ title, metrics }: SponsorPlacementMetricGroupProps) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-center text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {metrics.map((metric) => (
          <SponsorPlacementMetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            suffix={metric.suffix}
          />
        ))}
      </div>
    </div>
  );
}

function SponsorPlacementMetricTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string | undefined;
}) {
  return (
    <div className="bg-background ring-border/60 flex min-h-18 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-1">
      <span className="text-muted-foreground w-full max-w-full text-center text-xs leading-snug font-medium">
        {label}
      </span>
      <span className="text-foreground w-full text-center text-lg leading-none font-semibold tabular-nums">
        {value}
        {suffix ? (
          <span className="text-muted-foreground text-sm font-normal">{suffix}</span>
        ) : null}
      </span>
    </div>
  );
}
