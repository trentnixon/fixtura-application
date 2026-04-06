import type { AccountMeResponse, AccountSummary } from "@/types/api/account";

/** Query key for dev-only UI simulation on `/select-organisation`. Ignored unless `NEXT_PUBLIC_SELECT_ORG_SIMULATOR=true`. */
export const SELECT_ORG_SIM_QUERY = "orgSim" as const;

export type SelectOrgSimKind = "loading" | "none" | "one" | "multiple" | "error";

const ALLOWED: SelectOrgSimKind[] = ["loading", "none", "one", "multiple", "error"];

/** Parse `orgSim` query value. */
export function parseSelectOrgSim(value: string | null): SelectOrgSimKind | null {
  if (!value) return null;
  return ALLOWED.includes(value as SelectOrgSimKind) ? (value as SelectOrgSimKind) : null;
}

function orgDetails(
  id: number,
  name: string,
  sport: string,
  logo = "",
): NonNullable<AccountSummary["accountOrganisationDetails"]> {
  return {
    id,
    Name: name,
    href: `/o/${id}`,
    ParentLogo: logo,
    Sport: sport,
  };
}

function row(
  id: number,
  name: string,
  sport: string,
  opts?: { isActive?: boolean; isSetup?: boolean; logo?: string },
): AccountSummary {
  const base: AccountSummary = {
    id,
    accountOrganisationDetails: orgDetails(id, name, sport, opts?.logo ?? ""),
  };
  if (opts?.isActive !== undefined) base.isActive = opts.isActive;
  if (opts?.isSetup !== undefined) base.isSetup = opts.isSetup;
  return base;
}

/** Synthetic GET /account/me body for picker row counts (none / one / multiple). */
export function syntheticAccountMeResponseForSim(
  kind: Exclude<SelectOrgSimKind, "loading" | "error">,
): AccountMeResponse {
  switch (kind) {
    case "none":
      return {
        data: {
          accountId: 0,
          user: null,
          accounts: [],
        },
      };
    case "one":
      return {
        data: {
          accountId: 1,
          user: null,
          accounts: [row(1, "Demo Club", "Rugby", { isActive: true, isSetup: true })],
        },
      };
    case "multiple":
      return {
        data: {
          accountId: 1,
          user: null,
          accounts: [
            row(1, "Eastern Eagles", "AFL", { isActive: true, isSetup: true }),
            row(2, "Westside Netball", "Netball", { isActive: false, isSetup: true }),
            row(3, "City Youth FC", "Football", { isActive: true, isSetup: false }),
          ],
        },
      };
  }
}
