"use client";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";

export function GradeOrderingSaveFooter({
  hasChanges,
  saveDisabled,
  isPending,
  hasGroups,
  onReset,
  onClear,
  onSave,
}: {
  hasChanges: boolean;
  saveDisabled: boolean;
  isPending: boolean;
  hasGroups: boolean;
  onReset: () => void;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <TypographyMuted className="text-sm">
        {hasChanges ? "You have unsaved changes." : "Order matches the last saved version."}
      </TypographyMuted>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!hasChanges || isPending}
        >
          Reset changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={isPending || !hasGroups}
        >
          Use default ordering
        </Button>
        <Button type="button" onClick={onSave} disabled={saveDisabled}>
          {isPending ? "Saving…" : "Save order"}
        </Button>
      </div>
    </div>
  );
}
