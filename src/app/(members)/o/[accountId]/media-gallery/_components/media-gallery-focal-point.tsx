"use client";

import { useCallback, useId, useRef, useState, type PointerEvent } from "react";

import { TypographyCaption, TypographyHelperText } from "@/components/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { clampFocalPercent } from "../_utils/media-gallery-form";

type MediaGalleryFocalPointProps = {
  imageUrl: string;
  top: number;
  left: number;
  disabled?: boolean;
  onChange: (next: { top: number; left: number }) => void;
};

export function MediaGalleryFocalPoint({
  imageUrl,
  top,
  left,
  disabled = false,
  onChange,
}: MediaGalleryFocalPointProps) {
  const regionId = useId();
  const statusId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setFromClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el || disabled) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nextLeft = clampFocalPercent(((clientX - rect.left) / rect.width) * 100);
      const nextTop = clampFocalPercent(((clientY - rect.top) / rect.height) * 100);
      onChange({ top: nextTop, left: nextLeft });
    },
    [disabled, onChange],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setFromClientPoint(event.clientX, event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    setFromClientPoint(event.clientX, event.clientY);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const nudge = (deltaTop: number, deltaLeft: number) => {
    if (disabled) return;
    onChange({
      top: clampFocalPercent(top + deltaTop),
      left: clampFocalPercent(left + deltaLeft),
    });
  };

  return (
    <div className="grid gap-3">
      <div>
        <Label htmlFor={`${regionId}-top`}>Focal point</Label>
        <TypographyHelperText>
          Click or drag on the image, or use the coordinate fields and nudge buttons.
        </TypographyHelperText>
      </div>
      <div
        ref={containerRef}
        role="application"
        aria-label="Image focal point"
        aria-describedby={statusId}
        tabIndex={disabled ? -1 : 0}
        className="bg-muted focus-visible:ring-ring relative aspect-video w-full overflow-hidden rounded-lg border outline-none focus-visible:ring-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
          if (disabled) return;
          const step = event.shiftKey ? 5 : 1;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(-step, 0);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(step, 0);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(0, -step);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(0, step);
          }
        }}
      >
        <img src={imageUrl} alt="" className="size-full object-contain" draggable={false} />
        <span
          aria-hidden
          className="border-primary bg-primary/30 pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ top: `${top}%`, left: `${left}%` }}
        />
      </div>
      <TypographyCaption id={statusId} tone="muted" as="p">
        Focal point at {top.toFixed(1)}% from top and {left.toFixed(1)}% from left.
      </TypographyCaption>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor={`${regionId}-top`}>Top (%)</Label>
          <Input
            id={`${regionId}-top`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={top}
            disabled={disabled}
            onChange={(e) => onChange({ top: clampFocalPercent(Number(e.target.value)), left })}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`${regionId}-left`}>Left (%)</Label>
          <Input
            id={`${regionId}-left`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={left}
            disabled={disabled}
            onChange={(e) => onChange({ top, left: clampFocalPercent(Number(e.target.value)) })}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="text-sm underline-offset-2 hover:underline disabled:opacity-50"
          disabled={disabled}
          onClick={() => nudge(-1, 0)}
        >
          Nudge up
        </button>
        <button
          type="button"
          className="text-sm underline-offset-2 hover:underline disabled:opacity-50"
          disabled={disabled}
          onClick={() => nudge(1, 0)}
        >
          Nudge down
        </button>
        <button
          type="button"
          className="text-sm underline-offset-2 hover:underline disabled:opacity-50"
          disabled={disabled}
          onClick={() => nudge(0, -1)}
        >
          Nudge left
        </button>
        <button
          type="button"
          className="text-sm underline-offset-2 hover:underline disabled:opacity-50"
          disabled={disabled}
          onClick={() => nudge(0, 1)}
        >
          Nudge right
        </button>
      </div>
    </div>
  );
}
