import type { BillingProductState } from "../../_core/billing-state";

/** User-facing label for the coarse billing “product state” bucket (badge, headers, tooltips). */
export function labelForBillingProductState(state: BillingProductState): string {
  switch (state) {
    case "active_account":
      return "Active account";
    case "pending":
      return "Pending";
    case "activate_trial":
      return "Activate trial";
    case "create_subscription":
      return "Not Processing";
    case "access_uncertain":
      return "Access uncertain";
  }
}

/** Classes for an outline badge (border + soft fill + text), as on the billing page. */
export function billingProductStateBadgeSurfaceClass(state: BillingProductState): string {
  switch (state) {
    case "active_account":
      return "border-emerald-500/35 bg-emerald-500/12 text-emerald-950 dark:text-emerald-50";
    case "pending":
      return "border-amber-500/40 bg-amber-500/12 text-amber-950 dark:text-amber-50";
    case "create_subscription":
      return "border-red-500/35 bg-red-500/12 text-red-950 dark:text-red-50";
    case "activate_trial":
      return "border-sky-500/35 bg-sky-500/12 text-sky-950 dark:text-sky-50";
    case "access_uncertain":
      return "border-violet-500/35 bg-violet-500/12 text-violet-950 dark:text-violet-50";
  }
}

/** Text-only emphasis for inline status (no chip/badge). */
export function billingProductStateToneClass(state: BillingProductState): string {
  switch (state) {
    case "active_account":
      return "text-emerald-700 dark:text-emerald-300";
    case "pending":
      return "text-amber-800 dark:text-amber-200";
    case "create_subscription":
      return "text-red-700 dark:text-red-300";
    case "activate_trial":
      return "text-sky-800 dark:text-sky-200";
    case "access_uncertain":
      return "text-violet-800 dark:text-violet-200";
  }
}
