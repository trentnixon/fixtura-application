import { ROUTES } from "./routes";

/** Sign-in: user hit a protected members URL while logged out (middleware sets with `from`). */
export const LOGIN_REASON_CONTINUE = "continue" as const;

/** Query key on `/select-organisation` for gateway messaging. */
export const SELECT_ORG_REASON_QUERY = "reason" as const;

export const SELECT_ORG_GATEWAY_REASON = {
  forbidden: "forbidden",
  notFound: "not_found",
  invalidOrg: "invalid_org",
} as const;

export type SelectOrgGatewayReason =
  (typeof SELECT_ORG_GATEWAY_REASON)[keyof typeof SELECT_ORG_GATEWAY_REASON];

export function selectOrganisationUrlWithReason(reason: SelectOrgGatewayReason): string {
  const params = new URLSearchParams();
  params.set(SELECT_ORG_REASON_QUERY, reason);
  return `${ROUTES.selectOrganisation}?${params.toString()}`;
}

export function parseSelectOrgGatewayReason(value: string | null): SelectOrgGatewayReason | null {
  if (!value) return null;
  const allowed = Object.values(SELECT_ORG_GATEWAY_REASON) as string[];
  return allowed.includes(value) ? (value as SelectOrgGatewayReason) : null;
}

export function selectOrgReasonMessage(reason: SelectOrgGatewayReason): string {
  switch (reason) {
    case SELECT_ORG_GATEWAY_REASON.forbidden:
      return "You don’t have access to that organisation. Choose one below.";
    case SELECT_ORG_GATEWAY_REASON.notFound:
      return "That organisation wasn’t found. Choose one below.";
    case SELECT_ORG_GATEWAY_REASON.invalidOrg:
      return "That organisation link isn’t valid. Choose one below.";
    default:
      return "";
  }
}

/** Map Strapi/BFF HTTP status to gateway messaging (403 = no access, 404 = missing, 400 = bad id). */
export function selectOrgReasonFromApiStatus(status: number): SelectOrgGatewayReason | null {
  if (status === 403) return SELECT_ORG_GATEWAY_REASON.forbidden;
  if (status === 404) return SELECT_ORG_GATEWAY_REASON.notFound;
  if (status === 400) return SELECT_ORG_GATEWAY_REASON.invalidOrg;
  return null;
}
