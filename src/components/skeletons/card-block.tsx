import { Skeleton } from "@/components/ui/skeleton";

import type { ComponentProps } from "react";

export function CardBlockSkeleton(props: ComponentProps<"div">) {
  return (
    <div className="space-y-2 rounded-md border p-4" {...props}>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
