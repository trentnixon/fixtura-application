import {
  BILLING_LAB_SCENARIO_OPTIONS,
  type LabBillingStatus,
  type LabBillingSummary,
  type LabBillingTier,
} from "./lab-billing-types";

const LAB_ONLY = true as const;

const CLUB_ASSET_BLURB = [
  "Automated content creation",
  "Professional-grade digital assets",
  "Delivered to your inbox",
];

export const LAB_BILLING_TIER_CLUB_1M: LabBillingTier = {
  id: "lab-tier-club-1m",
  name: "1 Month Pass",
  description:
    "Kick off your season with Fixtura's One Month Pass, designed specifically for clubs looking for a quick, impactful way to boost their digital presence. For only $35 per week, totaling $140, enjoy a suite of automated content creation services that deliver professional-grade digital assets directly to your inbox.",
  category: "Club",
  price: 140,
  currency: "AUD",
  daysInPass: 30,
  priceByWeekInPass: 35,
  tagline: "Quick Play",
  coverageLabel: "30 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: CLUB_ASSET_BLURB,
  packageName: "Club — 1 Month",
  stripePriceId: "price_lab_club_1m",
  labOnly: LAB_ONLY,
};

export const LAB_BILLING_TIER_CLUB_3M: LabBillingTier = {
  id: "lab-tier-club-3m",
  name: "3-Month Pass",
  description:
    "Keep the momentum going with the Three Month Pass for clubs, priced at just $25 per week for a total of $300. This pass allows clubs to maintain a robust digital presence throughout the season, offering continuous, AI-driven content tailored to your club's needs.",
  category: "Club",
  price: 300,
  currency: "AUD",
  daysInPass: 90,
  priceByWeekInPass: 25,
  tagline: "Season Starter",
  coverageLabel: "90 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: CLUB_ASSET_BLURB,
  packageName: "Club — 3 Month",
  stripePriceId: "price_lab_club_3m",
  labOnly: LAB_ONLY,
};

export const LAB_BILLING_TIER_CLUB_SEASON: LabBillingTier = {
  id: "lab-tier-club-season",
  name: "Season Pass",
  description:
    "For the ultimate in comprehensive digital coverage, choose the Season Pass for clubs, which covers an entire year for only $20 per week, totaling $520. This extensive pass ensures your club is always in the spotlight with year-round, high-quality content.",
  category: "Club",
  price: 520,
  currency: "AUD",
  daysInPass: 365,
  priceByWeekInPass: 20,
  promoLine: "6 month + 6 months free",
  coverageLabel: "365 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: CLUB_ASSET_BLURB,
  packageName: "Club — Season",
  stripePriceId: "price_lab_club_season",
  labOnly: LAB_ONLY,
};

const ASSOC_ASSET_BLURB = [
  "AI-generated digital content",
  "Visibility and engagement",
  "Tailored for associations",
];

export const LAB_BILLING_TIER_ASSOC_1M: LabBillingTier = {
  id: "lab-tier-assoc-1m",
  name: "1-Month Pass",
  description:
    "Tailored for cricket associations seeking a quick digital boost, the One Month Pass is priced at $50 per week, totaling $200. This pass provides a focused surge of professional, AI-generated digital content designed to enhance visibility and engagement during key cricket events or peak periods.",
  category: "Association",
  price: 200,
  currency: "AUD",
  daysInPass: 30,
  priceByWeekInPass: 50,
  tagline: "Strategic Insight",
  coverageLabel: "30 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: ASSOC_ASSET_BLURB,
  packageName: "Association — 1 Month",
  stripePriceId: "price_lab_assoc_1m",
  labOnly: LAB_ONLY,
};

export const LAB_BILLING_TIER_ASSOC_3M: LabBillingTier = {
  id: "lab-tier-assoc-3m",
  name: "3-Month Pass",
  description:
    "Ideal for maintaining a vibrant community presence, the Three Month Pass for associations costs $40 per week, totaling $480. This plan supports sustained digital engagement with continuous, customized content that caters to the ongoing needs and activities of the association.",
  category: "Association",
  price: 480,
  currency: "AUD",
  daysInPass: 90,
  priceByWeekInPass: 40,
  tagline: "Seasonal Engagement",
  coverageLabel: "90 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: ASSOC_ASSET_BLURB,
  packageName: "Association — 3 Month",
  stripePriceId: "price_lab_assoc_3m",
  labOnly: LAB_ONLY,
};

export const LAB_BILLING_TIER_ASSOC_SEASON: LabBillingTier = {
  id: "lab-tier-assoc-season",
  name: "Season Association Pass",
  description:
    "The Season Pass, designed for associations, offers year-long coverage for just $25 per week, totaling $650. This extensive pass ensures consistent, engaging content throughout the year, covering both the active seasons and offseason periods.",
  category: "Association",
  price: 650,
  currency: "AUD",
  daysInPass: 365,
  priceByWeekInPass: 25,
  promoLine: "6 month + 6 months free",
  coverageLabel: "365 Days Covered",
  isActive: true,
  includeSponsors: true,
  includedAssetTypes: ASSOC_ASSET_BLURB,
  packageName: "Association — Season",
  stripePriceId: "price_lab_assoc_season",
  labOnly: LAB_ONLY,
};

export const LAB_BILLING_TIERS_BY_CATEGORY: Record<LabBillingTier["category"], LabBillingTier[]> = {
  Club: [LAB_BILLING_TIER_CLUB_1M, LAB_BILLING_TIER_CLUB_3M, LAB_BILLING_TIER_CLUB_SEASON],
  Association: [
    LAB_BILLING_TIER_ASSOC_1M,
    LAB_BILLING_TIER_ASSOC_3M,
    LAB_BILLING_TIER_ASSOC_SEASON,
  ],
};

/** All lab tiers (club + association). */
export const LAB_BILLING_TIERS: LabBillingTier[] = [
  ...LAB_BILLING_TIERS_BY_CATEGORY.Club,
  ...LAB_BILLING_TIERS_BY_CATEGORY.Association,
];

export function labBillingTiersForCategory(category: LabBillingTier["category"]): LabBillingTier[] {
  return LAB_BILLING_TIERS_BY_CATEGORY[category];
}

function accountLabel(accountId: string): string {
  return `Lab account ${accountId}`;
}

const SUPPORT: LabBillingSummary["availableActions"] = {
  canStartTrial: false,
  canSelectPlan: false,
  canStartCheckout: false,
  canRequestInvoice: false,
  canViewInvoice: false,
  canDownloadInvoice: false,
  canContactSupport: true,
};

function baseSummary(accountId: string, partial: Partial<LabBillingSummary>): LabBillingSummary {
  const accountName = accountLabel(accountId);
  const base: LabBillingSummary = {
    accountId,
    accountName,
    accessStatus: "pending",
    billingStatus: "not_started",
    currentPlan: null,
    trial: {
      isEligible: false,
      isActive: false,
      startDate: null,
      endDate: null,
      daysRemaining: null,
    },
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: { ...SUPPORT },
    ...partial,
  };
  return base;
}

function orderLab(
  partial: Partial<LabBillingSummary["activeOrder"]>,
): NonNullable<LabBillingSummary["activeOrder"]> {
  return {
    id: "ord_lab_1",
    status: "open",
    paymentStatus: "unpaid",
    startDate: "2026-04-01",
    endDate: "2026-09-28",
    daysRemaining: 120,
    hostedInvoiceUrl: null,
    invoicePdf: null,
    labOnly: LAB_ONLY,
    ...partial,
  };
}

/**
 * Map Route Lab `state` query to a billing summary fixture.
 * `default` and unknown values → not_started.
 */
export function billingLabSummaryForScenario(
  accountId: string,
  scenarioKey: string,
): LabBillingSummary {
  const known = BILLING_LAB_SCENARIO_OPTIONS as readonly string[];
  const s =
    scenarioKey === "default" || !known.includes(scenarioKey)
      ? "not_started"
      : (scenarioKey as Exclude<(typeof BILLING_LAB_SCENARIO_OPTIONS)[number], "default">);

  switch (s) {
    case "not_started":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "not_started",
        trial: {
          isEligible: true,
          isActive: false,
          startDate: null,
          endDate: null,
          daysRemaining: null,
        },
        availableActions: {
          ...SUPPORT,
          canStartTrial: true,
          canSelectPlan: true,
          canStartCheckout: true,
          canRequestInvoice: true,
        },
      });

    case "trial_available":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "trial_available",
        trial: {
          isEligible: true,
          isActive: false,
          startDate: null,
          endDate: null,
          daysRemaining: null,
        },
        availableActions: {
          ...SUPPORT,
          canStartTrial: true,
          canSelectPlan: true,
          canStartCheckout: true,
          canRequestInvoice: true,
        },
      });

    case "trial_active":
      return baseSummary(accountId, {
        accessStatus: "active",
        billingStatus: "trialing",
        trial: {
          isEligible: false,
          isActive: true,
          startDate: "2026-05-01",
          endDate: "2026-05-15",
          daysRemaining: 8,
        },
        availableActions: { ...SUPPORT, canContactSupport: true },
      });

    case "trial_ended":
      return baseSummary(accountId, {
        accessStatus: "restricted",
        billingStatus: "trial_ended",
        trial: {
          isEligible: false,
          isActive: false,
          startDate: "2026-04-01",
          endDate: "2026-04-15",
          daysRemaining: 0,
        },
        availableActions: {
          ...SUPPORT,
          canSelectPlan: true,
          canStartCheckout: true,
          canRequestInvoice: true,
        },
      });

    case "plan_selected":
      return baseSummary(accountId, {
        accessStatus: "restricted",
        billingStatus: "trial_ended",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        trial: {
          isEligible: false,
          isActive: false,
          startDate: "2026-02-01",
          endDate: "2026-02-15",
          daysRemaining: 0,
        },
        availableActions: {
          ...SUPPORT,
          canSelectPlan: true,
          canStartCheckout: true,
          canRequestInvoice: true,
        },
      });

    case "checkout_started":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "checkout_started",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        activeOrder: orderLab({
          status: "checkout_pending",
          paymentStatus: "unpaid",
          hostedInvoiceUrl: null,
        }),
        availableActions: { ...SUPPORT, canContactSupport: true },
      });

    case "payment_pending":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "payment_pending",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        activeOrder: orderLab({
          status: "paid_processing",
          paymentStatus: "processing",
        }),
        availableActions: { ...SUPPORT, canContactSupport: true },
      });

    case "payment_failed":
      return baseSummary(accountId, {
        accessStatus: "restricted",
        billingStatus: "payment_failed",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        activeOrder: orderLab({
          status: "failed",
          paymentStatus: "failed",
        }),
        availableActions: {
          ...SUPPORT,
          canStartCheckout: true,
          canRequestInvoice: true,
          canContactSupport: true,
        },
      });

    case "invoice_requested":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "invoice_requested",
        currentPlan: LAB_BILLING_TIER_ASSOC_SEASON,
        latestInvoiceRequest: {
          id: "invreq_lab_1",
          status: "submitted",
          submittedAt: "2026-03-10T02:00:00.000Z",
          selectedPlanName: LAB_BILLING_TIER_ASSOC_SEASON.name,
          labOnly: LAB_ONLY,
        },
        availableActions: { ...SUPPORT, canContactSupport: true },
      });

    case "invoice_under_review":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "invoice_under_review",
        currentPlan: LAB_BILLING_TIER_ASSOC_SEASON,
        latestInvoiceRequest: {
          id: "invreq_lab_2",
          status: "under_review",
          submittedAt: "2026-03-08T01:30:00.000Z",
          selectedPlanName: LAB_BILLING_TIER_ASSOC_SEASON.name,
          labOnly: LAB_ONLY,
        },
        availableActions: { ...SUPPORT, canContactSupport: true },
      });

    case "invoice_sent":
      return baseSummary(accountId, {
        accessStatus: "pending",
        billingStatus: "invoice_sent",
        currentPlan: LAB_BILLING_TIER_ASSOC_SEASON,
        activeOrder: orderLab({
          paymentStatus: "awaiting_payment",
          hostedInvoiceUrl: "https://example.com/lab-invoice",
        }),
        latestInvoiceRequest: {
          id: "invreq_lab_3",
          status: "invoice_sent",
          submittedAt: "2026-03-05T11:00:00.000Z",
          selectedPlanName: LAB_BILLING_TIER_ASSOC_SEASON.name,
          labOnly: LAB_ONLY,
        },
        availableActions: {
          ...SUPPORT,
          canViewInvoice: true,
          canDownloadInvoice: true,
        },
      });

    case "active_season":
      return baseSummary(accountId, {
        accessStatus: "active",
        billingStatus: "active",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        activeOrder: orderLab({
          status: "paid",
          paymentStatus: "paid",
          startDate: "2026-04-01",
          endDate: "2026-09-28",
          daysRemaining: 87,
        }),
        availableActions: { ...SUPPORT, canViewInvoice: true },
      });

    case "expired_season":
      return baseSummary(accountId, {
        accessStatus: "restricted",
        billingStatus: "expired",
        currentPlan: LAB_BILLING_TIER_CLUB_SEASON,
        activeOrder: orderLab({
          status: "complete",
          paymentStatus: "paid",
          startDate: "2025-04-01",
          endDate: "2025-09-30",
          daysRemaining: 0,
        }),
        availableActions: {
          ...SUPPORT,
          canSelectPlan: true,
          canStartCheckout: true,
          canRequestInvoice: true,
        },
      });

    case "cancelled":
      return baseSummary(accountId, {
        accessStatus: "cancelled",
        billingStatus: "cancelled",
        currentPlan: null,
        trial: {
          isEligible: false,
          isActive: false,
          startDate: null,
          endDate: null,
          daysRemaining: null,
        },
        availableActions: { ...SUPPORT },
      });
  }
}

export function billingStatusLabel(status: LabBillingStatus): string {
  return status.replace(/_/g, " ");
}
