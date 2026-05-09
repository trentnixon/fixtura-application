import type { AccountMePayload } from "@/types/api/account";

/**
 * Shows the **Generate Stripe invoice** CTA only when CMS marks an action flag
 * (`canCreateStripeInvoice` / snake_case variants) **or** the signed-in bootstrap user appears to be staff.
 *
 * Permissions are enforced by Strapi; this gate avoids surprising members with 403.
 */
export function shouldShowStripeImmediateInvoiceCreate(opts: {
  availableActions?: Partial<Record<string, boolean>> | null;
  me?: AccountMePayload | null;
}): boolean {
  const a = opts.availableActions ?? {};
  const actionTrue =
    a["canCreateStripeInvoice"] === true ||
    a["can_create_stripe_invoice"] === true ||
    a["createStripeInvoice"] === true ||
    /** Some CMS builders may shorten the prefix */
    a["stripe_invoice_create"] === true;

  if (actionTrue) {
    return true;
  }

  const roleName = opts.me?.user?.role?.name?.toLowerCase() ?? "";
  const roleTypeRaw = opts.me?.user?.role?.type?.toLowerCase() ?? "";

  /** Strapi Plugin Users & Permissions often exposes `authenticated` for all members — avoid granting on type alone. */
  if (
    roleName.includes("staff") ||
    roleName.includes("administrator") ||
    roleName.includes("moderator") ||
    roleTypeRaw === "admin"
  ) {
    return true;
  }

  return false;
}
