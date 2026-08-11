"use client";

import { WrappedAvatar } from "@/components/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarPanel() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Avatar</h3>
        <p className="text-muted-foreground text-sm">User image with fallback initials.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar>
            <AvatarImage src="/next.svg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/non-existent.png" alt="Broken" />
            <AvatarFallback>NA</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Variants</h3>
        <p className="text-muted-foreground text-sm">Sizes, square shape and status dot.</p>
        <div className="flex flex-wrap items-center gap-4">
          <WrappedAvatar size="sm" fallback="SM" status="online" />
          <WrappedAvatar size="md" fallback="MD" status="busy" />
          <WrappedAvatar size="lg" fallback="LG" status="offline" />
          <WrappedAvatar size="xl" fallback="XL" shape="square" status="online" />
        </div>
      </div>
    </div>
  );
}
