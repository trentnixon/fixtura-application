import type { TemplateModeContrastVariant } from "@/components/pickers/template-mode/_utils";

export function flatTileSelectedClass(
  isSelected: boolean,
  contrastVariant: TemplateModeContrastVariant,
): string {
  if (!isSelected) return "";
  if (contrastVariant === "dark" || contrastVariant === "dark-alt") {
    return "ring-2 ring-white/60 ring-offset-2 ring-offset-zinc-950";
  }
  return "ring-2 ring-primary ring-offset-2 ring-offset-background";
}

export function flatTileSurfaceClass(contrastVariant: TemplateModeContrastVariant): string {
  if (contrastVariant === "light" || contrastVariant === "light-alt") {
    return "!bg-white shadow-xl ring-1 ring-border hover:!bg-zinc-50/90";
  }
  if (contrastVariant === "dark" || contrastVariant === "dark-alt") {
    return "!bg-zinc-950 shadow-xl ring-1 ring-zinc-800 hover:!brightness-110";
  }
  return "";
}
