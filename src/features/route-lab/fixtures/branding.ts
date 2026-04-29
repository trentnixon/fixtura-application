import type { AccountBrandingData, BrandingMedia } from "@/types/api/account";

/** Display label for lab headers — matches ready fixture narrative. */
export const LAB_BRANDING_ORG_LABEL = "Eastern Eagles";

function labMedia(id: number, path: string): BrandingMedia {
  return {
    id,
    url: path,
    width: 192,
    height: 192,
    mime: "image/png",
    alternativeText: "Lab fixture logo",
  };
}

export const LAB_BRANDING_READY: AccountBrandingData = {
  id: 575,
  template: {
    id: 9001,
    name: "club_weekly_v3",
    frontEndName: "Club weekly highlights",
    requiresMedia: false,
    variation: "gradient_banner",
    category: "Club",
    templateVariation: "wide",
    divideFixturesBy: "round",
    bundleAudio: null,
    poster: labMedia(1, "/file.svg"),
    video: labMedia(2, "/file.svg"),
    gallery: [labMedia(3, "/window.svg")],
  },
  theme: {
    id: 42,
    name: "Club classics",
    theme: {
      primary: "#79001F",
      secondary: "#FDBC2C",
      dark: "#111111",
      white: "#FFFFFF",
    },
    isPublic: true,
  },
  template_option: { slug: "fixture-option", label: "Standard pack" },
  templateOptionId: 101,
  onboardingLogo: labMedia(99, "/logos/android-chrome-192x192.png"),
};

export const LAB_BRANDING_EMPTY: AccountBrandingData = {
  id: 575,
  template: null,
  theme: null,
  template_option: null,
};

export const LAB_BRANDING_LEGACY_THEME: AccountBrandingData = {
  ...LAB_BRANDING_READY,
  theme: {
    id: 77,
    name: "Legacy import",
    theme: {
      PrimaryColour: "#CC3366",
      SecondaryColour: "#336699",
      dark: "#222222",
      white: "#EEEEEE",
    },
    isPublic: false,
  },
};

export const LAB_BRANDING_MEDIA_REQUIRED: AccountBrandingData = {
  ...LAB_BRANDING_READY,
  template: {
    id: 9002,
    name: "club_media_heavy",
    frontEndName: "Club media heavy",
    requiresMedia: true,
    variation: "poster_forward",
    category: "Club",
    templateVariation: "media",
    divideFixturesBy: "club",
    bundleAudio: null,
    poster: null,
    video: null,
    gallery: [],
  },
};
