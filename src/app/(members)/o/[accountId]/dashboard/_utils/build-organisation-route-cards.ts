import { IconListDetails, IconMoneybag, IconPalette, IconPhoto } from "@tabler/icons-react";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import type {
  DashboardRouteActiveRatio,
  DashboardRouteChecklistItem,
  DashboardRouteLogoPreview,
  DashboardRoutePaletteSwatch,
} from "../_components/dashboard-route-list-card";
import type { DashboardViewModel } from "../dashboard-view-model";
import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { SeasonHubStatsResponse } from "@/types/api/season-hub";

export type OrganisationRouteCardConfig = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  headerIcon: typeof IconPalette;
  items: DashboardRouteChecklistItem[];
};

const SWATCH_KEYS = ["primary", "secondary", "dark", "white"] as const;

function extractBrandingPaletteSwatches(
  branding: AccountBrandingData | null,
): DashboardRoutePaletteSwatch[] {
  const theme = branding?.theme;
  const themeRecord =
    theme?.theme && typeof theme.theme === "object" && !Array.isArray(theme.theme)
      ? (theme.theme as Record<string, unknown>)
      : null;
  if (!themeRecord) return [];

  const swatches: DashboardRoutePaletteSwatch[] = [];
  for (const key of SWATCH_KEYS) {
    const raw = themeRecord[key];
    if (typeof raw === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
      swatches.push({ key, hex: raw });
    }
  }
  return swatches;
}

type ChecklistItemExtras = {
  swatches?: DashboardRoutePaletteSwatch[];
  logoPreview?: DashboardRouteLogoPreview;
  activeRatio?: DashboardRouteActiveRatio;
};

function checklistItem(
  label: string,
  complete: boolean,
  extras?: ChecklistItemExtras,
): DashboardRouteChecklistItem {
  if (!extras) return { label, complete };
  return { label, complete, ...extras };
}

export function buildOrganisationRouteCards({
  accountId,
  model,
  sponsors,
  seasonSummary,
}: {
  accountId: string;
  model: Pick<DashboardViewModel, "branding" | "orgDetails" | "organisationName">;
  sponsors: AccountSponsorDto[] | null;
  seasonSummary: SeasonHubStatsResponse["data"]["summary"] | null;
}): OrganisationRouteCardConfig[] {
  const { branding, orgDetails, organisationName } = model;
  const templateName = branding?.template?.name?.trim();
  const paletteSwatches = extractBrandingPaletteSwatches(branding);
  const logoUrl = orgDetails?.ParentLogo?.trim() || branding?.onboardingLogo?.url?.trim() || null;

  const sponsorItems = sponsors ?? [];
  const activeSponsors = sponsorItems.filter((s) => s.isActive);

  const competitions = seasonSummary?.competitions ?? 0;
  const grades = seasonSummary?.grades ?? 0;
  const fixtures = seasonSummary?.fixtures ?? 0;

  return [
    {
      title: "Branding",
      description: "Colours, templates, and theme.",
      href: accountScopedRoutes.branding(accountId),
      ctaLabel: "Open branding",
      headerIcon: IconPalette,
      items: [
        checklistItem(
          templateName ? `Template: ${templateName}` : "No template selected",
          Boolean(templateName),
        ),
        checklistItem(
          paletteSwatches.length > 0 ? "Palette colours" : "No palette colours set",
          paletteSwatches.length > 0,
          paletteSwatches.length > 0 ? { swatches: paletteSwatches } : undefined,
        ),
      ],
    },
    {
      title: "Logo",
      description: "Upload and manage your organisation logo.",
      href: accountScopedRoutes.brandLogo(accountId),
      ctaLabel: "Open logo",
      headerIcon: IconPhoto,
      items: [
        checklistItem(
          logoUrl ? "Logo on file" : "No logo uploaded",
          Boolean(logoUrl),
          logoUrl
            ? {
                logoPreview: {
                  url: logoUrl,
                  alt: `${organisationName} logo`,
                },
              }
            : undefined,
        ),
      ],
    },
    {
      title: "Sponsors",
      description: "Sponsor pool, placements, and assignments.",
      href: accountScopedRoutes.manageSponsors(accountId),
      ctaLabel: "Manage sponsors",
      headerIcon: IconMoneybag,
      items: [
        checklistItem(
          sponsorItems.length > 0
            ? `${sponsorItems.length} sponsor${sponsorItems.length === 1 ? "" : "s"} in pool`
            : "No sponsors in pool",
          sponsorItems.length > 0,
        ),
        checklistItem(
          "Active sponsors",
          sponsorItems.length > 0 && activeSponsors.length > 0,
          sponsorItems.length > 0
            ? { activeRatio: { active: activeSponsors.length, total: sponsorItems.length } }
            : undefined,
        ),
      ],
    },
    {
      title: "Season",
      description: "Competitions, grades, and fixtures.",
      href: accountScopedRoutes.season(accountId),
      ctaLabel: "Open season",
      headerIcon: IconListDetails,
      items: [
        checklistItem(
          competitions > 0
            ? `${competitions} competition${competitions === 1 ? "" : "s"}`
            : "No competitions",
          competitions > 0,
        ),
        checklistItem(
          grades > 0 ? `${grades} grade${grades === 1 ? "" : "s"}` : "No grades",
          grades > 0,
        ),
        checklistItem(
          fixtures > 0 ? `${fixtures} fixture${fixtures === 1 ? "" : "s"}` : "No fixtures",
          fixtures > 0,
        ),
      ],
    },
  ];
}
