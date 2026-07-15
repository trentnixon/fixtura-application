import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SelectOrgLoadingSkeletonProps = {
  className?: string;
  showControls?: boolean;
  showResume?: boolean;
};

export function SelectOrgLoadingSkeleton({
  className,
  showControls = true,
  showResume = true,
}: SelectOrgLoadingSkeletonProps) {
  return (
    <div className={cn("grid w-full max-w-7xl gap-6 py-4 2xl:max-w-[90rem]", className)}>
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {showResume ? <Skeleton className="h-24 w-full rounded-xl" /> : null}
      {showControls ? (
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-9 w-48" />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
