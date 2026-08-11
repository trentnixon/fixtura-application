/**
 * Canonical card-checkout action gate for the Season Pass create flow.
 *
 * `/billing/create` is the active purchase route; older `plan-checkout` UI should not own new
 * user-facing work. Keep this small helper shared by overview/debug/tests while CMS action flags
 * continue to stabilise.
 */
export function shouldShowPlanCheckout(
  actions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (actions == null) {
    return true;
  }
  if (
    actions["canCheckout"] === true ||
    actions["can_checkout"] === true ||
    actions["canSubscribe"] === true ||
    actions["can_subscribe"] === true ||
    actions["canStartCheckout"] === true ||
    actions["can_start_checkout"] === true
  ) {
    return true;
  }
  return Object.keys(actions).length === 0;
}
