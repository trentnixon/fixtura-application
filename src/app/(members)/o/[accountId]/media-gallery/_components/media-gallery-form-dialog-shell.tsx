"use client";

import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { ComponentProps, FormEvent, ReactNode } from "react";

type MediaGalleryFormDialogShellProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  contentClassName?: string;
  showCloseButton: boolean;
  onPointerDownOutside: NonNullable<ComponentProps<typeof DialogContent>["onPointerDownOutside"]>;
  onEscapeKeyDown: NonNullable<ComponentProps<typeof DialogContent>["onEscapeKeyDown"]>;
};

export function MediaGalleryFormDialogShell({
  header,
  footer,
  children,
  onSubmit,
  contentClassName,
  showCloseButton,
  onPointerDownOutside,
  onEscapeKeyDown,
}: MediaGalleryFormDialogShellProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl md:p-0",
        "border-primary/20 bg-background shadow-primary/10 shadow-xl",
        "dark:border-primary/25 dark:bg-background",
      )}
      showCloseButton={showCloseButton}
      onPointerDownOutside={onPointerDownOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <div
        className="from-primary via-brand-secondary to-brand-accent h-1.5 w-full shrink-0 bg-linear-to-r"
        aria-hidden
      />

      <div className="border-primary/10 bg-primary/5 shrink-0 border-b px-6 pt-5 pb-4 md:px-8">
        {header}
      </div>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
        <div
          className={cn(
            "bg-muted/20 min-h-0 flex-1 scroll-pb-4 overflow-y-auto px-6 py-5 md:px-8",
            contentClassName,
          )}
        >
          {children}
        </div>

        <DialogFooter
          className={cn(
            "border-primary/15 bg-primary/5 shrink-0 border-t px-6 py-4 backdrop-blur-sm",
            "pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8",
          )}
        >
          {footer}
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
