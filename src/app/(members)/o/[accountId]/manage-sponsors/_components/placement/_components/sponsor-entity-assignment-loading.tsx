import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SponsorEntityAssignmentLoading() {
  return (
    <div className={cn("grid gap-5", "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]")}>
      <div className="grid gap-3">
        <Skeleton className="h-10 w-full max-w-md" aria-hidden />
        <Skeleton className="h-72 w-full rounded-xl" aria-hidden />
      </div>
      <Skeleton className="h-72 w-full rounded-lg" aria-hidden />
    </div>
  );
}
