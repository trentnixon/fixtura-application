import {
  proxyAccountSecurityJsonMutation,
  type AccountSecurityRouteContext,
} from "../_account-security-proxy";

/** PATCH /api/accounts/:accountId/security/login-email → Strapi saveAccountSecurityLoginEmail */
export async function PATCH(request: Request, context: AccountSecurityRouteContext) {
  return proxyAccountSecurityJsonMutation(request, context, "security/login-email", "PATCH");
}
