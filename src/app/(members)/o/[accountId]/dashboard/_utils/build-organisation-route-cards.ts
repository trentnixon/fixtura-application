import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  BILLING_ENDING_BANNER_DESCRIPTION_LEAD,
  BILLING_ENDING_BANNER_TITLE,
} from "../../billing/_constants/overview/billingEndingBanner";
import {
  billingEndingBannerPeriodEndTrail,
  shouldShowBillingEndingBanner,
} from "../../billing/_utils/overview/billingEndingBanner";
import {
  buildActiveTrialStatusCardViewModel,
  buildPaidActiveStatusCardViewModel,
} from "../../billing/_utils/overview/billingOverviewStatusCards";
import { labelForBillingProductState } from "../../billing/_utils/overview/billingProductStateDisplay";
import {
  labelForAccessStatus,
  labelForBillingStatus,
  normalizeBillingCode,
} from "../../billing/_utils/overview/billingSummaryLabels";
import { formatBillingDateTable } from "../../billing/_utils/overview/formatBillingDisplay";

import type { BillingProductState, BillingUiMode } from "../../billing/_core/billing-state";
import type {
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  AccountBrandingData,
  AccountSponsorDto,
} from "@/types/api/account";

export type BrandingRoutePaletteSwatch = {
  key: string;
  hex: string;
};

export type BrandingRouteCardView = {
  title: string;
  description: string;
  logoUrl: string | null;
  paletteSwatches: BrandingRoutePaletteSwatch[];
};

export type SponsorsRouteCardView = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  poolCount: number;
  activeCount: number;
};

export type BillingRouteCardMetric = {
  label: string;
  value: string;
};

export type BillingRouteCardDetailRow = {
  label: string;
  value: string;
};

export type BillingRouteCardView = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  statusLabel: string;
  productState: BillingProductState;
  primaryMetric: BillingRouteCardMetric;
  secondaryMetric: BillingRouteCardMetric | null;
  detailRows: BillingRouteCardDetailRow[];
  progressPercent: number | null;
  progressAriaLabel: string | null;
  showEndingNotice: boolean;
  endingNoticeText: string | null;
  bodyFallback: string | null;
};

const SWATCH_KEYS = ["primary", "secondary", "dark", "white"] as const;

function extractBrandingPaletteSwatches(
  branding: AccountBrandingData | null,
): BrandingRoutePaletteSwatch[] {
  const theme = branding?.theme;
  const themeRecord =
    theme?.theme && typeof theme.theme === "object" && !Array.isArray(theme.theme)
      ? (theme.theme as Record<string, unknown>)
      : null;
  if (!themeRecord) return [];

  const swatches: BrandingRoutePaletteSwatch[] = [];
  for (const key of SWATCH_KEYS) {
    const raw = themeRecord[key];
    if (typeof raw === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
      swatches.push({ key, hex: raw });
    }
  }
  return swatches;
}

export function buildSponsorsRouteCard({
  accountId,
  sponsors,
}: {
  accountId: string;
  sponsors: AccountSponsorDto[] | null;
}): SponsorsRouteCardView {
  const sponsorItems = sponsors ?? [];
  const activeCount = sponsorItems.filter((sponsor) => sponsor.isActive).length;

  return {
    title: "Sponsors",
    description: "Sponsor pool, placements, and assignments.",
    href: accountScopedRoutes.manageSponsors(accountId),
    ctaLabel: "Manage sponsors",
    poolCount: sponsorItems.length,
    activeCount,
  };
}

export function buildBrandingRouteCard({
  branding,
  logoUrl,
}: {
  branding: AccountBrandingData | null;
  logoUrl: string | null;
}): BrandingRouteCardView {
  const paletteSwatches = extractBrandingPaletteSwatches(branding);
  const resolvedLogoUrl = logoUrl?.trim() || branding?.onboardingLogo?.url?.trim() || null;

  return {
    title: "Look & feel",
    description: "Logo and brand colours.",
    logoUrl: resolvedLogoUrl,
    paletteSwatches,
  };
}

function formatDaysRemainingMetric(daysRemaining: number | null): string {
  if (daysRemaining == null) return "—";
  if (daysRemaining === 0) return "Last day";
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;
}

function billingCreateHref(accountId: string): string {
  return `/o/${encodeURIComponent(accountId)}/billing/create`;
}

function billingDetailRowsFromSummary(
  billingSummary: AccountBillingSummaryV1,
): BillingRouteCardDetailRow[] {
  const rows: BillingRouteCardDetailRow[] = [];

  const billingStatus = billingSummary.billingStatus?.trim();
  if (billingStatus && normalizeBillingCode(billingStatus) !== "none") {
    rows.push({
      label: "Billing",
      value: labelForBillingStatus(billingStatus),
    });
  }

  const accessStatus = billingSummary.accessStatus?.trim();
  if (accessStatus && normalizeBillingCode(accessStatus) !== "none") {
    rows.push({
      label: "Access",
      value: labelForAccessStatus(accessStatus),
    });
  }

  return rows;
}

export function buildBillingRouteCard({
  accountId,
  billingUiMode,
  productState,
  billingSummary,
  orders,
}: {
  accountId: string;
  billingUiMode: BillingUiMode;
  productState: BillingProductState;
  billingSummary: AccountBillingSummaryV1;
  orders: AccountBillingOrderHistoryDto[];
}): BillingRouteCardView {
  const billingHref = accountScopedRoutes.billing(accountId);
  const createHref = billingCreateHref(accountId);
  const statusLabel = labelForBillingProductState(productState);

  const activeOrder = billingSummary.activeOrder;
  const showEndingNotice =
    (billingUiMode === "paid_active" || billingUiMode === "active_trial") &&
    activeOrder != null &&
    shouldShowBillingEndingBanner(activeOrder);

  const endingNoticeText = showEndingNotice
    ? `${BILLING_ENDING_BANNER_TITLE}. ${BILLING_ENDING_BANNER_DESCRIPTION_LEAD}${billingEndingBannerPeriodEndTrail(activeOrder?.endOrderAt)}`
    : null;

  let primaryMetric: BillingRouteCardMetric = { label: "Status", value: statusLabel };
  let secondaryMetric: BillingRouteCardMetric | null = null;
  let detailRows = billingDetailRowsFromSummary(billingSummary);
  let progressPercent: number | null = null;
  let progressAriaLabel: string | null = null;
  let bodyFallback: string | null = null;
  let ctaLabel = "View billing";
  let href = billingHref;

  switch (billingUiMode) {
    case "paid_active": {
      const vm = buildPaidActiveStatusCardViewModel(
        billingSummary.activeOrder,
        billingSummary.currentPlan,
        orders,
      );
      primaryMetric = { label: "Plan", value: vm.tierLabel ?? "—" };
      secondaryMetric = {
        label: "Remaining",
        value: formatDaysRemainingMetric(vm.daysRemaining),
      };
      progressPercent = vm.remainingPercent;
      progressAriaLabel =
        vm.remainingPercent != null
          ? `Time remaining in billing period: ${Math.round(vm.remainingPercent)} percent`
          : null;
      if (!vm.hasPeriodBounds && !vm.tierLabel) {
        bodyFallback = "Billing period dates were not returned in this summary.";
      } else if (vm.endAt) {
        detailRows = [
          ...detailRows,
          { label: "Period ends", value: formatBillingDateTable(vm.endAt) },
        ];
      }
      ctaLabel = "Manage billing";
      break;
    }
    case "active_trial": {
      const vm = buildActiveTrialStatusCardViewModel(billingSummary.trial);
      primaryMetric = { label: "Trial", value: vm.tierLabel ?? "Active trial" };
      secondaryMetric = {
        label: "Remaining",
        value: formatDaysRemainingMetric(vm.daysRemaining),
      };
      progressPercent = vm.remainingPercent;
      progressAriaLabel =
        vm.remainingPercent != null
          ? `Trial time remaining: ${Math.round(vm.remainingPercent)} percent`
          : null;
      if (!billingSummary.trial) {
        bodyFallback = "Trial dates were not returned in this summary.";
      } else if (billingSummary.trial.endDate) {
        detailRows = [
          ...detailRows,
          {
            label: "Trial ends",
            value: formatBillingDateTable(billingSummary.trial.endDate),
          },
        ];
      }
      break;
    }
    case "payment_pending":
      ctaLabel = "Continue on billing";
      break;
    case "free_trial_available":
      primaryMetric = { label: "Trial", value: "Available" };
      ctaLabel = "Start trial";
      break;
    case "trial_expired":
    case "no_billing":
      primaryMetric = { label: "Processing", value: "Not enabled" };
      ctaLabel = "Create subscription";
      href = createHref;
      break;
    case "access_denied":
    case "unknown":
      primaryMetric = { label: "Status", value: "Access uncertain" };
      break;
  }

  return {
    title: "Billing",
    description: "Subscription, trial, and payment status.",
    href,
    ctaLabel,
    statusLabel,
    productState,
    primaryMetric,
    secondaryMetric,
    detailRows,
    progressPercent,
    progressAriaLabel,
    showEndingNotice,
    endingNoticeText,
    bodyFallback,
  };
}
