import { LAB_BRANDING_READY } from "./branding";

import type { AccountBrandingData } from "@/types/api/account";

/** Distinct from `LAB_BRANDING_READY.onboardingLogo` so saved vs pending is visible in the lab. */
export const LAB_LOGO_UPLOADER_SEED_UPLOADED_PREVIEW_URL = "/window.svg";

/** Higher-resolution same-origin asset used as editable recrop source (display logo may differ). */
export const LAB_LOGO_UPLOADER_EDITABLE_SOURCE_URL = "/logos/android-chrome-512x512.png";

/** Fixture account branding with theme/colours but no saved onboarding logo. */
export const LAB_LOGO_UPLOADER_NO_LOGO: AccountBrandingData = {
  ...LAB_BRANDING_READY,
  onboardingLogo: null,
};

export type LogoUploaderLabScenario = {
  branding: AccountBrandingData;
  /** When set, same-origin URL passed to `ImageUploaderCrop` for “Recrop existing image”. */
  editableLogoSourceUrl?: string | null;
};

export const LAB_LOGO_SCENARIO_DEFAULT: LogoUploaderLabScenario = {
  branding: LAB_BRANDING_READY,
};

export const LAB_LOGO_SCENARIO_RECROP: LogoUploaderLabScenario = {
  branding: LAB_BRANDING_READY,
  editableLogoSourceUrl: LAB_LOGO_UPLOADER_EDITABLE_SOURCE_URL,
};

/** Saved display logo only — no editable source URL (replace-only messaging). */
export const LAB_LOGO_SCENARIO_RECROP_NO_SOURCE: LogoUploaderLabScenario = {
  branding: LAB_BRANDING_READY,
  editableLogoSourceUrl: null,
};

export function logoUploaderScenarioForLabState(state: string): LogoUploaderLabScenario {
  switch (state) {
    case "empty":
      return { branding: LAB_LOGO_UPLOADER_NO_LOGO };
    case "validation":
      return { branding: LAB_BRANDING_READY };
    case "recrop":
      return LAB_LOGO_SCENARIO_RECROP;
    case "recrop-no-source":
      return LAB_LOGO_SCENARIO_RECROP_NO_SOURCE;
    case "loading":
    case "error":
    case "saving":
    case "uploaded":
    case "default":
    default:
      return LAB_LOGO_SCENARIO_DEFAULT;
  }
}
