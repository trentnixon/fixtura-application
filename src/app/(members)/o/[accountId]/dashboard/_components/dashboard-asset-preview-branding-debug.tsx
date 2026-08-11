"use client";

import { useMemo, type ReactNode } from "react";

import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import {
  buildClubSponsorsPayloadFromAccountSponsors,
  readRemotionGradientFromBranding,
  readRemotionModeFromBrandingThemeJson,
  readRemotionPaletteKeyFromBranding,
} from "@/features/remotion-asset-preview";
import { resolveAccountTemplateCategorySlug } from "@/lib/branding/resolve-account-template-category-slug";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";

function fmtJson(value: unknown, max = 200): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string") return value.trim() === "" ? "—" : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    const s = JSON.stringify(value);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return "…";
  }
}

function DebugRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground py-0.5 text-xs">{label}</dt>
      <dd className="text-foreground min-w-0 py-0.5 font-mono text-[0.7rem] wrap-break-word">
        {children}
      </dd>
    </>
  );
}

function ColourSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="border-border inline-block size-3.5 shrink-0 rounded-sm border"
        style={{ backgroundColor: hex }}
        title={hex}
        aria-hidden
      />
      <span>
        {label}: {hex}
      </span>
    </span>
  );
}

function pickFirstString(...candidates: unknown[]): string | null {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return null;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function bundleAudioTrackCount(opt: Record<string, unknown> | null): number | null {
  if (opt == null) return null;
  const cat = opt["category"];
  const catRec = asRecord(cat);
  if (catRec == null) return null;
  const ba = catRec["bundleAudio"];
  const baRec = asRecord(ba);
  if (baRec == null) return null;
  const ao = baRec["audio_options"];
  return Array.isArray(ao) ? ao.length : null;
}

export type DashboardAssetPreviewBrandingDebugProps = {
  branding: AccountBrandingData | null;
  templateModeSlug: string | null;
  /** GET /sponsors items; when null, sponsors query failed or is loading. */
  accountSponsors: AccountSponsorDto[] | null;
};

export function DashboardAssetPreviewBrandingDebug({
  branding,
  templateModeSlug,
  accountSponsors,
}: DashboardAssetPreviewBrandingDebugProps) {
  const themeObj = asRecord(branding?.theme?.theme);
  const optRec = asRecord(branding?.template_option);

  const resolvedCategorySlug = resolveAccountTemplateCategorySlug(branding);
  const templateCategoryFromRow = branding?.template?.category?.trim() || null;

  const optCategoryRec = optRec != null ? asRecord(optRec["category"]) : null;
  const categorySlugFromOption =
    optCategoryRec != null ? pickFirstString(optCategoryRec["slug"]) : null;
  const categoryNameFromOption =
    optCategoryRec != null ? pickFirstString(optCategoryRec["name"]) : null;

  const templateName = pickFirstString(branding?.template?.name);

  const modeRaw = pickFirstString(themeObj?.["mode"], optRec?.["mode"]);
  const modeId = themeObj?.["modeId"] ?? optRec?.["modeId"];
  const templateOptionModeId = readTemplateModeId(branding?.template_option ?? null);

  const remotionMode = readRemotionModeFromBrandingThemeJson(branding);
  const palette = themeColoursFromAccountBrandingTheme(branding?.theme ?? null);

  const useBackground = pickFirstString(
    themeObj?.["useBackground"] as string | undefined,
    optRec?.["useBackground"] as string | undefined,
  );

  const gradientRaw = themeObj?.["gradient"] ?? optRec?.["gradient"];
  const gradientObject = asRecord(gradientRaw);
  const gradientCatalogLabel = pickFirstString(
    gradientObject?.["name"] as string | undefined,
    gradientObject?.["type"] != null && gradientObject?.["direction"] != null
      ? `${String(gradientObject["type"])} / ${String(gradientObject["direction"])}`
      : undefined,
    typeof gradientRaw === "string" ? gradientRaw : undefined,
  );
  const remotionGradient = readRemotionGradientFromBranding(branding);
  const pattern = themeObj?.["pattern"] ?? optRec?.["pattern"];
  const particle = themeObj?.["particle"] ?? optRec?.["particle"];
  const noise = themeObj?.["noise"] ?? optRec?.["noise"];
  const texture = themeObj?.["texture"] ?? optRec?.["texture"];
  const video = themeObj?.["video"] ?? optRec?.["video"];
  const image = themeObj?.["image"] ?? optRec?.["image"];
  const paletteObject = optRec != null ? asRecord(optRec["palette"]) : null;
  const paletteCatalogLabel = pickFirstString(
    paletteObject?.["name"] as string | undefined,
    paletteObject?.["value"] as string | undefined,
    themeObj?.["palette"] as string | undefined,
    typeof optRec?.["palette"] === "string" ? optRec["palette"] : undefined,
  );
  const remotionPaletteKey = readRemotionPaletteKeyFromBranding(branding);

  const sponsorsFromTheme = themeObj?.["sponsors"];
  const sponsorsFromOption = optRec?.["sponsors"];

  const onboardingLogoUrl =
    branding?.onboardingLogo != null &&
    typeof branding.onboardingLogo === "object" &&
    "url" in branding.onboardingLogo
      ? pickFirstString((branding.onboardingLogo as { url?: string }).url)
      : null;

  const divideFixturesBy = optCategoryRec?.["divideFixturesBy"];
  const audioCount = bundleAudioTrackCount(optRec);

  const sponsorsSorted =
    accountSponsors == null
      ? null
      : [...accountSponsors]
          .filter((s) => s.isActive)
          .sort((a, b) => {
            const oa = a.order ?? 9999;
            const ob = b.order ?? 9999;
            if (oa !== ob) return oa - ob;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          });

  const mergedClubSponsors = useMemo(
    () => buildClubSponsorsPayloadFromAccountSponsors(accountSponsors),
    [accountSponsors],
  );

  const mergedClubSponsorsJson = useMemo(() => {
    try {
      return JSON.stringify(mergedClubSponsors, null, 2);
    } catch {
      return "…";
    }
  }, [mergedClubSponsors]);

  return (
    <dl className="grid max-w-3xl grid-cols-[minmax(0,11rem)_1fr] gap-x-4 gap-y-1">
      <DebugRow label="Template option id">
        {branding?.templateOptionId != null ? String(branding.templateOptionId) : "—"}
      </DebugRow>
      <DebugRow label="Resolved category slug">{resolvedCategorySlug ?? "—"}</DebugRow>
      <DebugRow label="Template.category (row)">{templateCategoryFromRow ?? "—"}</DebugRow>
      <DebugRow label="template_option.category.slug">{categorySlugFromOption ?? "—"}</DebugRow>
      <DebugRow label="template_option.category.name">{categoryNameFromOption ?? "—"}</DebugRow>
      <DebugRow label="Template (name)">{templateName ?? "—"}</DebugRow>
      <DebugRow label="divideFixturesBy (summary)">
        {divideFixturesBy != null ? fmtJson(divideFixturesBy, 220) : "—"}
      </DebugRow>
      <DebugRow label="Bundle audio tracks">
        {audioCount != null ? String(audioCount) : "—"}
      </DebugRow>
      <DebugRow label="Mode (theme / option)">{modeRaw ?? "—"}</DebugRow>
      <DebugRow label="Mode id (theme / option)">
        {modeId != null ? fmtJson(modeId, 40) : "—"}
      </DebugRow>
      <DebugRow label="Mode id (template_option→CMS)">
        {templateOptionModeId != null ? String(templateOptionModeId) : "—"}
      </DebugRow>
      <DebugRow label="Template mode slug (CMS)">{templateModeSlug ?? "—"}</DebugRow>
      <DebugRow label="→ Remotion variation mode">{remotionMode ?? "—"}</DebugRow>
      <DebugRow label="Palette (catalog)">{paletteCatalogLabel ?? "—"}</DebugRow>
      <DebugRow label="→ Remotion palette key">{remotionPaletteKey ?? "—"}</DebugRow>
      <DebugRow label="Colours (resolved)">
        <span className="flex flex-col gap-1">
          <ColourSwatch hex={palette.primary} label="Primary" />
          <ColourSwatch hex={palette.secondary} label="Secondary" />
          <ColourSwatch hex={palette.dark} label="Dark" />
          <ColourSwatch hex={palette.white} label="White" />
        </span>
      </DebugRow>
      <DebugRow label="Onboarding logo">{onboardingLogoUrl ?? "—"}</DebugRow>
      <DebugRow label="Sponsors (account, active)">
        {sponsorsSorted == null ? (
          "—"
        ) : sponsorsSorted.length === 0 ? (
          <span className="text-muted-foreground font-sans text-xs">No active sponsors</span>
        ) : (
          <div className="space-y-2 font-sans">
            <p className="text-muted-foreground font-mono text-[0.65rem]">
              {sponsorsSorted.length} active
            </p>
            <ul className="text-foreground max-h-40 list-inside list-disc space-y-0.5 overflow-y-auto text-xs">
              {sponsorsSorted.map((s) => (
                <li key={s.id}>
                  <span className="font-medium">{s.name}</span>
                  {s.isPrimary ? (
                    <span className="text-muted-foreground font-normal"> · primary</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </DebugRow>
      <DebugRow label="Preview → videoMeta.club.sponsors">
        {accountSponsors == null ? (
          "—"
        ) : (
          <pre className="text-foreground max-h-64 overflow-auto font-mono text-[0.65rem] leading-relaxed wrap-break-word whitespace-pre-wrap">
            {mergedClubSponsorsJson}
          </pre>
        )}
      </DebugRow>
      <DebugRow label="Sponsors (theme JSON)">{fmtJson(sponsorsFromTheme, 160)}</DebugRow>
      <DebugRow label="Sponsors (template_option)">{fmtJson(sponsorsFromOption, 160)}</DebugRow>
      <DebugRow label="useBackground (background type)">{useBackground ?? "—"}</DebugRow>
      <DebugRow label="Gradient (catalog)">{gradientCatalogLabel ?? "—"}</DebugRow>
      <DebugRow label="→ Remotion gradient">
        {remotionGradient != null
          ? `${remotionGradient.type} / ${remotionGradient.direction}`
          : "—"}
      </DebugRow>
      <DebugRow label="Gradient (raw JSON)">
        {gradientRaw != null ? fmtJson(gradientRaw) : "—"}
      </DebugRow>
      <DebugRow label="Pattern">{pattern != null ? fmtJson(pattern) : "—"}</DebugRow>
      <DebugRow label="Particle">{particle != null ? fmtJson(particle) : "—"}</DebugRow>
      <DebugRow label="Noise">{noise != null ? fmtJson(noise) : "—"}</DebugRow>
      <DebugRow label="Texture">{texture != null ? fmtJson(texture) : "—"}</DebugRow>
      <DebugRow label="Video bg">{video != null ? fmtJson(video, 180) : "—"}</DebugRow>
      <DebugRow label="Image bg">{image != null ? fmtJson(image, 180) : "—"}</DebugRow>
      <DebugRow label="Theme row name">{branding?.theme?.name?.trim() || "—"}</DebugRow>
      <DebugRow label="Theme id">
        {branding?.theme?.id != null ? String(branding.theme.id) : "—"}
      </DebugRow>
    </dl>
  );
}
