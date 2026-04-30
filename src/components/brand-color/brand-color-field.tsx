"use client";

import { useEffect, useId, useRef, useState } from "react";

import { TypographyMuted } from "@/components/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isWeakWhiteOnBrandContrast, stripHexInput, tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import { BrandColorPopoverPanel } from "./brand-color-popover";
import { BrandColorPreviewCard, type BrandColorPreviewVariant } from "./brand-color-preview-card";
import {
  PersistentFieldFeedback,
  type PersistentFieldFeedbackVariant,
} from "./persistent-field-feedback";

export type MinContrastMode = "none" | "recommended" | "strict";

export type BrandColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Overrides default “A brand color is required” when `required` is true. */
  requiredErrorMessage?: string;
  showPreview?: boolean;
  previewVariant?: BrandColorPreviewVariant;
  allowReset?: boolean;
  defaultValue?: string;
  validateContrast?: boolean;
  minContrastMode?: MinContrastMode;
  onValidChange?: (isValid: boolean) => void;
  /** Save / system feedback (e.g. sandbox). Shown when no blocking validation error. */
  externalFeedback?: {
    variant: PersistentFieldFeedbackVariant;
    message: string;
  } | null;
  className?: string;
};

export function BrandColorField({
  label,
  value,
  onChange,
  description,
  placeholder = "#F20100",
  disabled,
  required,
  requiredErrorMessage = "A brand color is required",
  showPreview = true,
  previewVariant = "asset-card",
  allowReset,
  defaultValue,
  validateContrast = true,
  minContrastMode = "recommended",
  onValidChange,
  externalFeedback,
  className,
}: BrandColorFieldProps) {
  const id = useId();
  const fieldId = `${id}-hex`;
  const feedbackId = `${id}-feedback`;
  const descId = `${id}-desc`;

  const [open, setOpen] = useState(false);

  const lastValidPreviewRef = useRef<string>(tryNormalizeHex(value) ?? "#64748B");
  const normalized = tryNormalizeHex(value);
  if (normalized) {
    lastValidPreviewRef.current = normalized;
  }
  const previewHex = normalized ?? lastValidPreviewRef.current;

  const handleDraftChange = (next: string) => {
    onChange(next);
  };

  let validationError: string | null = null;
  let validationWarning: string | null = null;

  const empty = stripHexInput(value) === "";

  if (required && empty) {
    validationError = requiredErrorMessage;
  } else if (!empty && !normalized) {
    validationError = "Enter a valid 6-digit HEX color";
  } else if (normalized && validateContrast && minContrastMode === "strict") {
    if (isWeakWhiteOnBrandContrast(normalized)) {
      validationError =
        "This colour does not meet contrast requirements for white text (strict mode).";
    }
  } else if (normalized && validateContrast && minContrastMode === "recommended") {
    if (isWeakWhiteOnBrandContrast(normalized)) {
      validationWarning = "This colour may be difficult to read with light text";
    }
  }

  const isValid = validationError === null;

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  const resolvedFeedback = (() => {
    if (validationError) {
      return { variant: "error" as const, message: validationError };
    }
    if (externalFeedback?.variant === "error") {
      return externalFeedback;
    }
    if (validationWarning) {
      return { variant: "warning" as const, message: validationWarning };
    }
    if (externalFeedback) {
      return externalFeedback;
    }
    return null;
  })();

  const describedBy =
    [description ? descId : null, resolvedFeedback ? feedbackId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor={fieldId}>{label}</Label>
        {description ? (
          <TypographyMuted className="text-sm leading-relaxed">
            <span id={descId}>{description}</span>
          </TypographyMuted>
        ) : null}

        <Popover open={open} onOpenChange={setOpen}>
          <div className="flex flex-row items-center gap-3">
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "border-border size-12 shrink-0 rounded-xl border-2 shadow-sm transition-opacity",
                  "focus-visible:ring-primary/40 hover:opacity-95 focus-visible:ring-[3px] focus-visible:outline-none",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                style={{ backgroundColor: previewHex }}
                aria-label="Open colour picker"
              />
            </PopoverTrigger>
            <Input
              id={fieldId}
              className="min-w-0 flex-1 font-mono"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={validationError !== null}
              aria-describedby={describedBy}
            />
          </div>
          <PopoverContent
            className="w-[min(100vw-2rem,22rem)] max-w-[calc(100vw-2rem)] min-w-0 p-4"
            align="start"
          >
            <BrandColorPopoverPanel
              idPrefix={id}
              draft={value}
              onDraftChange={handleDraftChange}
              {...(defaultValue !== undefined ? { defaultValue } : {})}
              allowReset={allowReset ?? false}
              disabled={disabled ?? false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {resolvedFeedback ? (
        <PersistentFieldFeedback id={feedbackId} variant={resolvedFeedback.variant}>
          {resolvedFeedback.message}
        </PersistentFieldFeedback>
      ) : null}

      {showPreview ? (
        <BrandColorPreviewCard accentHex={previewHex} variant={previewVariant} />
      ) : null}
    </div>
  );
}
