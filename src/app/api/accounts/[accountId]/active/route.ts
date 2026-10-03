import {
  proxyAccountSecurityJsonMutation,
  type AccountSecurityRouteContext,
} from "../security/_account-security-proxy";

/** PATCH /api/accounts/:accountId/active → Strapi setAccountActive */
export async function PATCH(request: Request, context: AccountSecurityRouteContext) {
  return proxyAccountSecurityJsonMutation(request, context, "active", "PATCH");
}
