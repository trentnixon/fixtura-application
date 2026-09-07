import { assembleAccountRemotionPreview } from "./assemble-account-remotion-preview";
import {
  auditSavedBrandingCompleteness,
  type SavedBrandingFieldGap,
} from "./audit-saved-branding-completeness";
import { buildRemotionPreviewDraftFromCurrentSelection } from "./build-remotion-preview-draft-for-saved-branding";
import { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";

import type { RemotionPreviewDraft } from "../types/remotion-preview-draft";
import type { AccountBrandingData, AccountMediaLibraryImage } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
} from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type { SavedBrandingFieldGap } from "./audit-saved-branding-completeness";
export { auditSavedBrandingCompleteness, buildRemotionPreviewDraftFromCurrentSelection };

export type TemplateVariationDiffEntry = {
  path: string;
  saved: unknown;
  builder: unknown;
};

export type AccountRemotionPreviewParityRecommendation =
  "already-aligned" | "cms-only" | "client-resolver" | "inconclusive";

export type AccountRemotionPreviewParityDiagnostic = {
  useBackground: string | null;
  brandingGaps: SavedBrandingFieldGap[];
  brandingComplete: boolean;
  assemblyParity: "match" | "mismatch" | "skipped";
  templateVariationDiff: TemplateVariationDiffEntry[];
  recommendation: AccountRemotionPreviewParityRecommendation;
  notes: string[];
};

export type DiagnoseAccountRemotionPreviewParityInput = {
  branding: AccountBrandingData | null;
  catalog: AllTemplateOptionsPayload | null;
  draft?: RemotionPreviewDraft | null;
  previewImage?: AccountMediaLibraryImage | null;
  logoUrl?: string | null;
  templateModeSlug?: string | null;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
  baseDataset: FixturaDataset;
};

function extractTemplateVariation(data: FixturaDataset): Record<string, unknown> {
  const root = data as unknown as Record<string, unknown>;
  const vm = root["videoMeta"] as Record<string, unknown>;
  const video = vm["video"] as Record<string, unknown>;
  return (video["templateVariation"] as Record<string, unknown>) ?? {};
}

function sortKeysDeep(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  const rec = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(rec).sort()) {
    sorted[key] = sortKeysDeep(rec[key]);
  }
  return sorted;
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value ?? null));
}

function diffTemplateVariation(
  savedTv: Record<string, unknown>,
  builderTv: Record<string, unknown>,
): TemplateVariationDiffEntry[] {
  const keys = new Set([...Object.keys(savedTv), ...Object.keys(builderTv)]);
  const diffs: TemplateVariationDiffEntry[] = [];

  for (const path of [...keys].sort()) {
    const saved = savedTv[path];
    const builder = builderTv[path];
    if (stableJson(saved) !== stableJson(builder)) {
      diffs.push({ path, saved, builder });
    }
  }

  return diffs;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function inferRecommendation(
  brandingComplete: boolean,
  assemblyParity: AccountRemotionPreviewParityDiagnostic["assemblyParity"],
  brandingGaps: SavedBrandingFieldGap[],
): AccountRemotionPreviewParityRecommendation {
  if (assemblyParity === "skipped") return "inconclusive";
  if (assemblyParity === "match" && brandingComplete) return "already-aligned";
  if (assemblyParity === "match" && !brandingComplete) return "cms-only";
  if (brandingGaps.length > 0) return "client-resolver";
  return "inconclusive";
}

/**
 * Phase A diagnostic: compare saved branding assembly vs builder-equivalent draft assembly.
 */
export function diagnoseAccountRemotionPreviewParity(
  input: DiagnoseAccountRemotionPreviewParityInput,
): AccountRemotionPreviewParityDiagnostic {
  const notes: string[] = [];
  const useBackground = readUseBackgroundFromAccountBranding(input.branding);
  const brandingGaps = auditSavedBrandingCompleteness(input.branding);
  const brandingComplete = brandingGaps.length === 0;

  const draft =
    input.draft ??
    (input.catalog != null ? buildRemotionPreviewDraftFromCurrentSelection(input.catalog) : null);

  if (input.branding === null) {
    return {
      useBackground,
      brandingGaps,
      brandingComplete: false,
      assemblyParity: "skipped",
      templateVariationDiff: [],
      recommendation: "client-resolver",
      notes: ["branding is null — cannot assemble saved preview."],
    };
  }

  if (draft === null || input.catalog === null) {
    notes.push("catalog or currentSelection missing — builder draft assembly skipped.");
    return {
      useBackground,
      brandingGaps,
      brandingComplete,
      assemblyParity: "skipped",
      templateVariationDiff: [],
      recommendation: "inconclusive",
      notes,
    };
  }

  const common = {
    base: input.baseDataset,
    logoUrl: input.logoUrl ?? null,
    templateModeSlug: input.templateModeSlug ?? null,
    templateCategoryCatalog: input.templateCategoryCatalog ?? input.catalog.categories,
  };

  const saved = assembleAccountRemotionPreview({
    ...common,
    source: {
      kind: "saved",
      branding: input.branding,
      previewImage: input.previewImage ?? null,
      templateOptionsCatalog: input.catalog,
      templateCategoryCatalog: input.templateCategoryCatalog ?? input.catalog.categories,
    },
  });

  const builder = assembleAccountRemotionPreview({
    ...common,
    source: {
      kind: "draft",
      branding: input.branding,
      draft,
      templateOptionsCatalog: input.catalog,
      templateCategoryCatalog: input.templateCategoryCatalog ?? input.catalog.categories,
      previewImage: input.previewImage ?? null,
    },
  });

  const savedTv = extractTemplateVariation(saved.data);
  const builderTv = extractTemplateVariation(builder.data);
  const templateVariationDiff = diffTemplateVariation(savedTv, builderTv);
  const assemblyParity = templateVariationDiff.length === 0 ? "match" : "mismatch";

  if (assemblyParity === "mismatch" && brandingComplete) {
    notes.push(
      "Assembly mismatch despite complete branding audit — check previewImage, templateModeSlug, or theme/template_option precedence.",
    );
  }

  if (assemblyParity === "match" && !brandingComplete) {
    notes.push(
      "Assembly matches builder draft but saved branding audit reports gaps — catalog expansion may be masking thin CMS fields.",
    );
  }

  const themeUseBackground = asRecord(input.branding.theme?.theme)?.["useBackground"];
  const optionUseBackground = input.branding.template_option?.["useBackground"];
  if (
    typeof themeUseBackground === "string" &&
    typeof optionUseBackground === "string" &&
    themeUseBackground !== optionUseBackground
  ) {
    notes.push(
      `theme.theme.useBackground (${themeUseBackground}) differs from template_option.useBackground (${optionUseBackground}); saved reader prefers template_option.`,
    );
  }

  return {
    useBackground,
    brandingGaps,
    brandingComplete,
    assemblyParity,
    templateVariationDiff,
    recommendation: inferRecommendation(brandingComplete, assemblyParity, brandingGaps),
    notes,
  };
}
