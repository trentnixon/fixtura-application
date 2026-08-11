export type BillingCheckoutReturnOutcome = "success" | "cancelled";

export type CheckoutReturnBannerProps = {
  outcome: BillingCheckoutReturnOutcome;
};
