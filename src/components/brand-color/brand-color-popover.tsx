"use client";

import { HexColorPicker } from "react-colorful";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tryNormalizeHex } from "@/lib/brand-color";

export type BrandColorPopoverPanelProps = {
  /** Current draft (may be invalid while typing — picker uses last valid or neutral). */
  draft: string;
  onDraftChange: (next: string) => void;
  defaultValue?: string;
  allowReset?: boolean;
  disabled?: boolean;
  /** Unique id prefix for inputs (a11y). */
  idPrefix: string;
};

function pickerSafeHex(draft: string): string {
  return tryNormalizeHex(draft) ?? "#888888";
}

/**
 * Popover body: swatch summary, react-colorful, HEX input, optional reset.
 * Wrap with `Popover` + `PopoverContent` in the parent.
 */
export function BrandColorPopoverPanel({
  draft,
  onDraftChange,
  defaultValue,
  allowReset,
  disabled,
  idPrefix,
}: BrandColorPopoverPanelProps) {
  const normalized = tryNormalizeHex(draft);
  const displayHex = normalized ?? pickerSafeHex(draft);

  function handlePickerChange(next: string) {
    const n = tryNormalizeHex(next) ?? tryNormalizeHex(`#${next.replace(/^#/, "")}`);
    if (n) onDraftChange(n);
  }

  function handleReset() {
    if (defaultValue === undefined) return;
    const n = tryNormalizeHex(defaultValue);
    if (n) onDraftChange(n);
  }

  const hexInputId = `${idPrefix}-popover-hex`;

  return (
    <div className="box-border w-full max-w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex items-center gap-3">
        <div
          className="border-border size-12 shrink-0 rounded-lg border-2 shadow-inner"
          style={{ backgroundColor: displayHex }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <TypographyMuted className="text-[10px] font-semibold tracking-wide uppercase">
            Current
          </TypographyMuted>
          <p className="text-foreground font-mono text-sm font-medium">{displayHex}</p>
          {!normalized ? (
            <TypographyMuted className="text-xs">
              Enter a valid HEX to sync the picker
            </TypographyMuted>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <Label className="text-xs">Colour</Label>
        <div className="min-w-0 overflow-hidden [&_.react-colorful]:h-40 [&_.react-colorful]:w-full [&_.react-colorful]:max-w-full">
          <HexColorPicker color={pickerSafeHex(draft)} onChange={handlePickerChange} />
        </div>
      </div>

      <div className="min-w-0 space-y-1.5">
        <Label htmlFor={hexInputId} className="text-xs">
          HEX value
        </Label>
        <Input
          id={hexInputId}
          className="min-w-0 font-mono"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="#F20100"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
        />
      </div>

      {allowReset && defaultValue !== undefined ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full max-w-full min-w-0"
          onClick={handleReset}
          disabled={disabled}
        >
          Reset to default
        </Button>
      ) : null}
    </div>
  );
}
