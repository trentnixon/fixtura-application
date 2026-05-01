import {
  proxyAccountSecurityJsonMutation,
  type AccountSecurityRouteContext,
} from "../_account-security-proxy";

/** PATCH /api/accounts/:accountId/security/profile → Strapi saveAccountSecurityProfile */
export async function PATCH(request: Request, context: AccountSecurityRouteContext) {
  return proxyAccountSecurityJsonMutation(request, context, "security/profile", "PATCH");
}
