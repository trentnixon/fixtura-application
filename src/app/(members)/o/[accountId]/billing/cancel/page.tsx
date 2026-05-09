import { redirect } from "next/navigation";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import { BILLING_CHECKOUT_RETURN_PARAM } from "../_constants/checkout/billingCheckoutReturnParams";

/**
 * Stripe Checkout `cancel_url` entrypoint.
 * Optional query: `session_id`, `checkout_session_id` (Stripe may append) — we intentionally
 * do not forward them to `/billing`, where they would be treated as a success return.
 *
 * @see src/app/(members)/o/[accountId]/billing/.comms/resources/billing-checkout-return-urls.md
 */
export default async function BillingCheckoutCancelPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const dest = new URLSearchParams();
  dest.set(BILLING_CHECKOUT_RETURN_PARAM.billingCheckout, "cancelled");
  redirect(`${accountScopedRoutes.billing(accountId)}?${dest.toString()}`);
}
