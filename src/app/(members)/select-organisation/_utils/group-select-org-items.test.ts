import { describe, expect, it } from "vitest";

import { groupSelectOrgItemsByStatus, selectOrgStatusGroupId } from "./group-select-org-items";

import type { SelectOrganisationItemViewModel } from "./select-org-display-state";

function item(
  over: Pick<SelectOrganisationItemViewModel, "accountId" | "name" | "displayState">,
): SelectOrganisationItemViewModel {
  return {
    statusLabel: "",
    statusDescription: "",
    primaryActionLabel: "Open organisation",
    isNew: false,
    isLastUsed: false,
    canRetrySetup: false,
    ...over,
  };
}

describe("selectOrgStatusGroupId", () => {
  it("keeps openable and unknown statuses with Active", () => {
    expect(selectOrgStatusGroupId("active")).toBe("active");
    expect(selectOrgStatusGroupId("preparing")).toBe("active");
    expect(selectOrgStatusGroupId("updating")).toBe("active");
    expect(selectOrgStatusGroupId("status-loading")).toBe("active");
    expect(selectOrgStatusGroupId("status-unavailable")).toBe("active");
  });

  it("groups setup and failed preparation as Needs attention", () => {
    expect(selectOrgStatusGroupId("needs-attention")).toBe("needs-attention");
    expect(selectOrgStatusGroupId("setup-required")).toBe("needs-attention");
  });

  it("keeps inactive organisations in their own group", () => {
    expect(selectOrgStatusGroupId("inactive")).toBe("inactive");
  });
});

describe("groupSelectOrgItemsByStatus", () => {
  it("preserves incoming order inside each group and drops empty attention and inactive groups", () => {
    const groups = groupSelectOrgItemsByStatus([
      item({ accountId: "2", name: "Zebra", displayState: "active" }),
      item({ accountId: "1", name: "Alpha", displayState: "updating" }),
    ]);

    expect(groups.map((group) => group.id)).toEqual(["active"]);
    expect(groups[0]?.items.map((entry) => entry.name)).toEqual(["Zebra", "Alpha"]);
  });
});
