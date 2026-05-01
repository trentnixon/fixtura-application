import {
  proxyAccountSecurityJsonMutation,
  type AccountSecurityRouteContext,
} from "../_account-security-proxy";

/** POST /api/accounts/:accountId/security/password → Strapi changeAccountSecurityPassword */
export async function POST(request: Request, context: AccountSecurityRouteContext) {
  return proxyAccountSecurityJsonMutation(request, context, "security/password", "POST");
}
