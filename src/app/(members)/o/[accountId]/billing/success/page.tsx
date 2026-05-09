import { redirect } from "next/navigation";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BILLING_CHECKOUT_RETURN_PARAM } from "../_constants/billingCheckoutReturnParams";

function firstString(value: string | string[] | undefined): string | null {
  if (value === undefined) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null) return null;
  const s = raw.trim();
  return s.length > 0 ? s : null;
}

/**
 * Stripe Checkout `success_url` entrypoint.
 * Forwards recognised success markers to `/billing` so `useBillingOverviewLifecycle` runs unchanged.
 *
 * @see src/app/(members)/o/[accountId]/billing/.comms/resources/billing-checkout-return-urls.md
 */
export default async function BillingCheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { accountId } = await params;
  const sp = await searchParams;
  const sessionId = firstString(sp[BILLING_CHECKOUT_RETURN_PARAM.sessionId]);
  const checkoutSessionId = firstString(sp[BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId]);

  const dest = new URLSearchParams();
  if (sessionId) {
    dest.set(BILLING_CHECKOUT_RETURN_PARAM.sessionId, sessionId);
  } else if (checkoutSessionId) {
    dest.set(BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId, checkoutSessionId);
  } else {
    dest.set(BILLING_CHECKOUT_RETURN_PARAM.billingCheckout, "success");
  }

  redirect(`${accountScopedRoutes.billing(accountId)}?${dest.toString()}`);
}
