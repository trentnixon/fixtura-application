"use client";

import { CardBlockSkeleton, ListItemSkeleton, TextBlockSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoadingPanel() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Skeletons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <ListItemSkeleton avatarSize={40} primaryWidth={160} secondaryWidth={120} />
            <TextBlockSkeleton lines={3} widths={[100, 90, 80]} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardBlockSkeleton />
            <CardBlockSkeleton />
            <CardBlockSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
