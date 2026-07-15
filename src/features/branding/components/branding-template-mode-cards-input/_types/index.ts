import type { TemplateModeUiItem } from "@/types/api/template-modes";
import type { ReactNode } from "react";

export type BrandingTemplateModeCardsInputProps = {
  accountId: string;
  interactive: boolean;
  /** Brand hex strings from colour fields; tiles use a primary→secondary gradient when both normalise. */
  brandPrimaryHex?: string | null;
  brandSecondaryHex?: string | null;
};

export type BrandingTemplateModeCardsInputState =
  | { phase: "readonly" }
  | { phase: "loading" }
  | { phase: "error"; error: unknown }
  | { phase: "empty" }
  | {
      phase: "ready";
      modes: TemplateModeUiItem[];
      selectValue: string;
      setSelectedId: (id: string | null | undefined) => void;
    };

export type ContrastSelectorCardProps = {
  headerDescription?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export type ModeGridCardsProps = {
  modes: TemplateModeUiItem[];
  selectValue: string;
  setSelectedId: (id: string | null | undefined) => void;
  brandPrimaryHex?: string | null | undefined;
  brandSecondaryHex?: string | null | undefined;
  /** Compact tiles for dense editors (e.g. template-builder). Default fills the row like branding. */
  density?: "default" | "compact";
};
