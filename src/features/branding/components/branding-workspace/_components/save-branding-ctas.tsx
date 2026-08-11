"use client";

import { PersistentFieldFeedback } from "@/components/brand-color";
import { Button } from "@/components/ui/button";

export type SaveBrandingCtasVariant = "mobile" | "desktop";

export type SaveBrandingCtasProps = {
  interactive: boolean;
  colorsReady: boolean;
  isPending: boolean;
  confirmedAt: string | null;
  cmsSaveLabStub: boolean;
  onOpenSaveDialog: () => void;
  variant: SaveBrandingCtasVariant;
};

export function SaveBrandingCtas({
  interactive,
  colorsReady,
  isPending,
  confirmedAt,
  cmsSaveLabStub,
  onOpenSaveDialog,
  variant,
}: SaveBrandingCtasProps) {
  if (!interactive) return null;

  const wrapperClassName =
    variant === "mobile"
      ? "flex flex-col gap-3 min-[1025px]:hidden"
      : "hidden min-[1025px]:flex flex-col gap-3 border-t pt-4";

  const buttonClassName = variant === "mobile" ? "w-full" : "w-full sm:w-auto sm:self-end";

  return (
    <div className={wrapperClassName}>
      <Button
        type="button"
        variant="brand"
        className={buttonClassName}
        disabled={!colorsReady || isPending}
        onClick={onOpenSaveDialog}
      >
        Save branding
      </Button>
      {confirmedAt ? (
        <PersistentFieldFeedback variant="success">
          Saved at {confirmedAt}.{" "}
          {cmsSaveLabStub ? "Route lab — CMS/API call not executed." : "Colours updated."}
        </PersistentFieldFeedback>
      ) : null}
    </div>
  );
}
