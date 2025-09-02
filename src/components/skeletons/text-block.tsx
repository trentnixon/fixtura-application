import { Skeleton } from "@/components/ui/skeleton";

export function TextBlockSkeleton({ lines = 3, widths }: { lines?: number; widths?: number[] }) {
  const resolved = widths && widths.length > 0 ? widths : [80, 70, 60];
  const sequence = Array.from({ length: lines }, (_, i) => resolved[i % resolved.length]);
  return (
    <div className="space-y-2">
      {sequence.map((w, idx) => (
        <Skeleton key={idx} className="h-4" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}
