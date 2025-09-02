"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonsPanel() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Error</Button>
        {/* Semantic custom variants */}
        <Button
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-amber-500 text-black hover:bg-amber-600",
          )}
        >
          Warning
        </Button>
        <Button
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-sky-500 text-white hover:bg-sky-600",
          )}
        >
          Info
        </Button>
        <Button
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-brand text-brand-foreground hover:opacity-90",
          )}
        >
          CTA
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>
          Disabled (Outline)
        </Button>
        <Button
          className={cn(buttonVariants({ variant: "default" }), "relative pl-8")}
          disabled
          aria-busy="true"
        >
          <span className="absolute left-2">⏳</span>
          Loading...
        </Button>
      </div>
    </div>
  );
}
