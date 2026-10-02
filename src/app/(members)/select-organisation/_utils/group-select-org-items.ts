import type {
  SelectOrganisationDisplayState,
  SelectOrganisationItemViewModel,
} from "./select-org-display-state";

export type SelectOrgStatusGroupId = "active" | "needs-attention" | "inactive";

export type SelectOrgStatusGroup = {
  id: SelectOrgStatusGroupId;
  label: string;
  items: SelectOrganisationItemViewModel[];
};

const SELECT_ORG_STATUS_GROUPS = [
  { id: "active", label: "Active" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "inactive", label: "Inactive" },
] as const satisfies readonly { id: SelectOrgStatusGroupId; label: string }[];

export function selectOrgStatusGroupId(
  displayState: SelectOrganisationDisplayState,
): SelectOrgStatusGroupId {
  switch (displayState) {
    case "needs-attention":
    case "setup-required":
      return "needs-attention";
    case "inactive":
      return "inactive";
    case "active":
    case "preparing":
    case "updating":
    case "status-loading":
    case "status-unavailable":
      return "active";
    default: {
      const _exhaustive: never = displayState;
      return _exhaustive;
    }
  }
}

/**
 * Active is always returned so the create-organisation card has a section.
 * Empty Needs attention and Inactive groups are omitted.
 * Order within each group follows the incoming list.
 */
export function groupSelectOrgItemsByStatus(
  items: readonly SelectOrganisationItemViewModel[],
): SelectOrgStatusGroup[] {
  const byGroup: Record<SelectOrgStatusGroupId, SelectOrganisationItemViewModel[]> = {
    active: [],
    "needs-attention": [],
    inactive: [],
  };

  for (const item of items) {
    byGroup[selectOrgStatusGroupId(item.displayState)].push(item);
  }

  return SELECT_ORG_STATUS_GROUPS.flatMap((group) => {
    const groupItems = byGroup[group.id];
    if (group.id !== "active" && groupItems.length === 0) return [];
    return [{ id: group.id, label: group.label, items: groupItems }];
  });
}
