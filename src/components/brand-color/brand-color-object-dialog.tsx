"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Fixed tokens included in the CMS-style brand colour object (not editable in the lab). */
export const BRAND_OBJECT_DARK = "#111" as const;
export const BRAND_OBJECT_WHITE = "#FFF" as const;

export type BrandColorObject = {
  primary: string;
  secondary: string;
  dark: typeof BRAND_OBJECT_DARK;
  white: typeof BRAND_OBJECT_WHITE;
};

export type BrandColorObjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: BrandColorObject | null;
};

export function BrandColorObjectDialog({ open, onOpenChange, value }: BrandColorObjectDialogProps) {
  const [copied, setCopied] = useState(false);

  const json =
    value === null
      ? ""
      : JSON.stringify(
          {
            primary: value.primary,
            secondary: value.secondary,
            dark: value.dark,
            white: value.white,
          },
          null,
          2,
        );

  const handleCopy = async () => {
    if (!json) return;
    try {
      await globalThis.navigator.clipboard.writeText(json);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Brand colour object</DialogTitle>
          <DialogDescription>
            Normalised values as they would be sent to the CMS (lab preview only).
          </DialogDescription>
        </DialogHeader>

        {value ? (
          <pre className="bg-muted max-h-[min(50vh,24rem)] overflow-auto rounded-xl border p-4 font-mono text-xs leading-relaxed">
            {json}
          </pre>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleCopy()} disabled={!value}>
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
