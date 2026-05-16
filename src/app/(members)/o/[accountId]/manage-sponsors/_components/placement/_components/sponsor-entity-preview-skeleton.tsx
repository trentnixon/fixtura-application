import { Skeleton } from "@/components/ui/skeleton";

export function SponsorEntityPreviewSkeleton() {
  return (
    <div className="bg-card text-card-foreground ring-border w-full overflow-hidden rounded-2xl shadow-xl ring-1">
      <div className="border-border space-y-2 border-b px-6 py-5">
        <Skeleton className="h-3 w-28" aria-hidden />
        <Skeleton className="h-9 w-full max-w-sm" aria-hidden />
      </div>
      <Skeleton className="aspect-4/5 w-full rounded-none" aria-hidden />
    </div>
  );
}
