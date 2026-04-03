/**
 * Opaque / evolving — prefer typing the fields your screens actually use.
 * Aligns with legacy fixturaContentHub + filterAccountData outputs.
 */
export type AccountContentHubPayload = {
  FirstName?: string;
  DeliveryAddress?: string;
  accountOrganisationDetails?: {
    id: number;
    Name: string;
    href: string;
    ParentLogo: string;
    Sport: string;
  };
  [key: string]: unknown;
};

/** Populated account document slice; shape follows Strapi entity API. */
export type AccountMeExtended = Record<string, unknown>;

export interface AccountMeUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: {
    id: number;
    name: string;
    type: string;
  } | null;
}

/** Summary row for gateway account picker (`accounts[]` on GET /api/account/me). */
export interface AccountSummary {
  id: number;
  contentHub?: AccountContentHubPayload;
  [key: string]: unknown;
}

export interface AccountMePayload {
  accountId: number;
  user: AccountMeUser | null;
  contentHub: AccountContentHubPayload;
  /** Accounts the JWT user may open (gateway selection). */
  accounts?: AccountSummary[];
  /** Only when called with ?depth=extended */
  extended?: AccountMeExtended;
}

/** Success body for GET /api/account/me */
export interface AccountMeResponse {
  data: AccountMePayload;
}

/**
 * Full dashboard aggregate for one account (GET /api/account/organisation/:accountId).
 * Field-level detail is evolving — type only what screens consume.
 */
export type OrganisationAccountDetailsData = AccountContentHubPayload & {
  id?: number;
  isActive?: boolean;
  isSetup?: boolean;
  Sport?: string;
  account_type?: number;
  scheduler?: Record<string, unknown>;
  render_token?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  renders?: unknown[];
  rollup?: Record<string, unknown>;
  metricsOverTime?: Record<string, unknown>;
  metricsAsPercentageOfCost?: Record<string, unknown>;
  [key: string]: unknown;
};

export interface OrganisationAccountDetailsResponse {
  data: OrganisationAccountDetailsData;
}
