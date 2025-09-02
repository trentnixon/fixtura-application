import { Skeleton } from "@/components/ui/skeleton";

export function ListItemSkeleton({
  avatarSize = 48,
  primaryWidth = 200,
  secondaryWidth = 160,
}: {
  avatarSize?: number;
  primaryWidth?: number;
  secondaryWidth?: number;
}) {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton style={{ width: avatarSize, height: avatarSize }} className="rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4" style={{ width: primaryWidth }} />
        <Skeleton className="h-4" style={{ width: secondaryWidth }} />
      </div>
    </div>
  );
}
