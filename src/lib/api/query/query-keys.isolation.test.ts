import { describe, expect, it } from "vitest";

import { queryKeys } from "./query-keys";

const ACCOUNT_A = "123";
const ACCOUNT_B = "456";

describe("queryKeys account isolation", () => {
  it("produces distinct keys for two account ids across high-risk domains", () => {
    expect(queryKeys.account.billing(ACCOUNT_A)).not.toEqual(queryKeys.account.billing(ACCOUNT_B));
    expect(queryKeys.account.branding(ACCOUNT_A)).not.toEqual(
      queryKeys.account.branding(ACCOUNT_B),
    );
    expect(queryKeys.account.onboardingState(ACCOUNT_A)).not.toEqual(
      queryKeys.account.onboardingState(ACCOUNT_B),
    );
    expect(queryKeys.account.scheduler(ACCOUNT_A)).not.toEqual(
      queryKeys.account.scheduler(ACCOUNT_B),
    );
    expect(queryKeys.account.renders(ACCOUNT_A)).not.toEqual(queryKeys.account.renders(ACCOUNT_B));
    expect(queryKeys.seasonHub.recon(ACCOUNT_A)).not.toEqual(queryKeys.seasonHub.recon(ACCOUNT_B));
    expect(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A)).not.toEqual(
      queryKeys.ui.assetPickerSelectedId(ACCOUNT_B),
    );
    expect(queryKeys.ui.templateCategoryPickerSelectedId(ACCOUNT_A)).not.toEqual(
      queryKeys.ui.templateCategoryPickerSelectedId(ACCOUNT_B),
    );
  });

  it("is stable for the same account id", () => {
    expect(queryKeys.account.billing(ACCOUNT_A)).toEqual(queryKeys.account.billing(ACCOUNT_A));
    expect(queryKeys.ui.assetPickerSelectedId(ACCOUNT_A)).toEqual(
      queryKeys.ui.assetPickerSelectedId(ACCOUNT_A),
    );
  });
});
