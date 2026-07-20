import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import type {
  AccountMediaLibraryAgeGroup,
  AccountMediaLibraryCategoryAssignment,
  AccountMediaLibraryCategoryAssignmentWrite,
  AccountMediaLibraryCategoryStatus,
  AccountMediaLibraryCategoryType,
  AccountMediaLibraryItem,
  AccountMediaLibraryResolvedTarget,
  AccountSettingsData,
} from "@/types/api/account";
import type { GradeOrderingGroupDto, GradeOrderingItemDto } from "@/types/api/grade-ordering";
import type { SeasonHubCompetitionListItem } from "@/types/api/season-hub";

export type MediaGalleryCategoryOption = {
  id: string;
  label: string;
  targetKeys: Array<string | number>;
  selectable: boolean;
};

export type MediaGalleryCategoryConfig = {
  type: AccountMediaLibraryCategoryType;
  categoryLabel: string;
  allLabel: string;
  viewLabel: string;
  filterEmptyLabel: string;
  options: MediaGalleryCategoryOption[];
  isLoading: boolean;
  isError: boolean;
};

export type MediaGalleryEffectiveCategory = {
  type: AccountMediaLibraryCategoryType;
  scope: "all" | "selected";
  targets: Array<string | number>;
  status: AccountMediaLibraryCategoryStatus;
};

export function resolveMediaGalleryCategoryType(
  settings: Pick<AccountSettingsData, "account_type" | "group_assets_by"> | null | undefined,
): AccountMediaLibraryCategoryType {
  if (!settings || settings.account_type === CLUB_ACCOUNT_TYPE_ID) {
    return "club-age";
  }
  return settings.group_assets_by ? "grade" : "competition";
}

export function buildClubAgeCategoryOptions(
  splitSeniorsAndMasters: boolean,
): MediaGalleryCategoryOption[] {
  if (splitSeniorsAndMasters) {
    return [
      { id: "junior", label: "Juniors", targetKeys: ["junior"], selectable: true },
      { id: "senior", label: "Seniors", targetKeys: ["senior"], selectable: true },
      { id: "masters", label: "Masters", targetKeys: ["masters"], selectable: true },
    ];
  }
  return [
    { id: "junior", label: "Juniors", targetKeys: ["junior"], selectable: true },
    {
      id: "senior-masters",
      label: "Seniors & Masters",
      targetKeys: ["senior", "masters"],
      selectable: true,
    },
  ];
}

export function buildCompetitionCategoryOptions(
  competitions: readonly SeasonHubCompetitionListItem[],
): MediaGalleryCategoryOption[] {
  return competitions.map((competition) => ({
    id: String(competition.id),
    label: competition.name?.trim() || `Competition ${competition.id}`,
    targetKeys: [competition.id],
    selectable: true,
  }));
}

export function buildGradeCategoryOptionsFromOrdering(
  groups: readonly GradeOrderingGroupDto[],
): MediaGalleryCategoryOption[] {
  const byId = new Map<number, MediaGalleryCategoryOption>();
  for (const group of groups) {
    for (const item of group.items) {
      if (byId.has(item.gradeId)) continue;
      byId.set(item.gradeId, gradeItemToOption(item));
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
}

function gradeItemToOption(item: GradeOrderingItemDto): MediaGalleryCategoryOption {
  const label = item.gradeName?.trim() || `Grade ${item.gradeId}`;
  return {
    id: String(item.gradeId),
    label,
    targetKeys: [item.gradeId],
    selectable: true,
  };
}

export function mergeHistoricalCategoryOptions(
  currentOptions: readonly MediaGalleryCategoryOption[],
  resolvedTargets: readonly AccountMediaLibraryResolvedTarget[] | undefined,
): MediaGalleryCategoryOption[] {
  const merged = new Map(currentOptions.map((option) => [option.id, option]));
  for (const target of resolvedTargets ?? []) {
    const id = String(target.id);
    if (merged.has(id)) {
      const existing = merged.get(id)!;
      merged.set(id, { ...existing, selectable: target.selectable });
      continue;
    }
    merged.set(id, {
      id,
      label: target.label,
      targetKeys: [target.id],
      selectable: target.selectable,
    });
  }
  return Array.from(merged.values());
}

export function buildMediaGalleryCategoryConfig(params: {
  settings: Pick<
    AccountSettingsData,
    "account_type" | "group_assets_by" | "split_seniors_and_masters"
  > | null;
  competitions: readonly SeasonHubCompetitionListItem[] | undefined;
  gradeGroups: readonly GradeOrderingGroupDto[] | undefined;
  resolvedTargets?: readonly AccountMediaLibraryResolvedTarget[];
  isLoading: boolean;
  isError: boolean;
}): MediaGalleryCategoryConfig {
  const type = resolveMediaGalleryCategoryType(params.settings);
  const splitSeniorsAndMasters = Boolean(params.settings?.split_seniors_and_masters);

  if (type === "club-age") {
    const options = mergeHistoricalCategoryOptions(
      buildClubAgeCategoryOptions(splitSeniorsAndMasters),
      params.resolvedTargets,
    );
    return {
      type,
      categoryLabel: "Age category",
      allLabel: "All ages",
      viewLabel: "By age",
      filterEmptyLabel: "All ages",
      options,
      isLoading: params.isLoading,
      isError: params.isError,
    };
  }

  if (type === "competition") {
    const options = mergeHistoricalCategoryOptions(
      buildCompetitionCategoryOptions(params.competitions ?? []),
      params.resolvedTargets,
    );
    return {
      type,
      categoryLabel: "Competition",
      allLabel: "All competitions",
      viewLabel: "By competition",
      filterEmptyLabel: "All competitions",
      options,
      isLoading: params.isLoading,
      isError: params.isError,
    };
  }

  const options = mergeHistoricalCategoryOptions(
    buildGradeCategoryOptionsFromOrdering(params.gradeGroups ?? []),
    params.resolvedTargets,
  );
  return {
    type,
    categoryLabel: "Grade",
    allLabel: "All grades",
    viewLabel: "By grade",
    filterEmptyLabel: "All grades",
    options,
    isLoading: params.isLoading,
    isError: params.isError,
  };
}

export function legacyAgeGroupToCategoryAssignment(
  ageGroup: AccountMediaLibraryAgeGroup,
  type: AccountMediaLibraryCategoryType = "club-age",
): AccountMediaLibraryCategoryAssignment {
  if (ageGroup === "Both") {
    return { type, scope: "all", targets: [] };
  }
  if (ageGroup === "Juniors") {
    return { type, scope: "selected", targets: ["junior"] };
  }
  return { type, scope: "selected", targets: ["senior", "masters"] };
}

export function getEffectiveCategoryFromItem(
  item: Pick<AccountMediaLibraryItem, "ageGroup" | "categoryAssignment" | "categoryStatus">,
  configType: AccountMediaLibraryCategoryType,
): MediaGalleryEffectiveCategory {
  if (item.categoryAssignment) {
    return {
      type: item.categoryAssignment.type,
      scope: item.categoryAssignment.scope,
      targets: [...item.categoryAssignment.targets],
      status: item.categoryStatus ?? "valid",
    };
  }
  const legacy = legacyAgeGroupToCategoryAssignment(item.ageGroup, configType);
  return { ...legacy, status: "valid" };
}

export function defaultCategoryAssignmentWrite(
  config: Pick<MediaGalleryCategoryConfig, "type">,
): AccountMediaLibraryCategoryAssignmentWrite {
  return {
    type: config.type,
    scope: "all",
    targets: [],
  };
}

export function categoryAssignmentEquals(
  a: AccountMediaLibraryCategoryAssignmentWrite,
  b: AccountMediaLibraryCategoryAssignmentWrite,
): boolean {
  if (a.type !== b.type || a.scope !== b.scope) return false;
  if (a.targets.length !== b.targets.length) return false;
  const normalizedA = normalizeTargetKeys(a.targets);
  const normalizedB = normalizeTargetKeys(b.targets);
  return normalizedA.every((value, index) => value === normalizedB[index]);
}

function normalizeTargetKeys(targets: readonly (string | number)[]): string[] {
  return [...targets]
    .map((target) => String(target))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function targetsFromOptionIds(
  optionIds: readonly string[],
  options: readonly MediaGalleryCategoryOption[],
): Array<string | number> {
  const optionById = new Map(options.map((option) => [option.id, option]));
  const keys = new Set<string>();
  const result: Array<string | number> = [];

  for (const optionId of optionIds) {
    const option = optionById.get(optionId);
    if (!option) continue;
    for (const key of option.targetKeys) {
      const normalized = String(key);
      if (keys.has(normalized)) continue;
      keys.add(normalized);
      result.push(key);
    }
  }

  return result;
}

function optionIdsFromTargets(
  targets: readonly (string | number)[],
  options: readonly MediaGalleryCategoryOption[],
): string[] {
  if (targets.length === 0) return [];
  const normalizedTargets = new Set(targets.map((target) => String(target)));
  const selected: string[] = [];

  for (const option of options) {
    const optionKeys = option.targetKeys.map((key) => String(key));
    if (optionKeys.length > 0 && optionKeys.every((key) => normalizedTargets.has(key))) {
      selected.push(option.id);
    }
  }

  return selected;
}

export function categoryAssignmentToOptionIds(
  assignment: AccountMediaLibraryCategoryAssignmentWrite,
  options: readonly MediaGalleryCategoryOption[],
): string[] {
  if (assignment.scope === "all") return [];
  return optionIdsFromTargets(assignment.targets, options);
}

export function buildCategoryAssignmentFromSelection(params: {
  config: Pick<MediaGalleryCategoryConfig, "type" | "options">;
  scope: "all" | "selected";
  selectedOptionIds: readonly string[];
}): AccountMediaLibraryCategoryAssignmentWrite {
  if (params.scope === "all") {
    return { type: params.config.type, scope: "all", targets: [] };
  }
  return {
    type: params.config.type,
    scope: "selected",
    targets: targetsFromOptionIds(params.selectedOptionIds, params.config.options),
  };
}

export function toggleClubCategoryOption(
  current: AccountMediaLibraryCategoryAssignmentWrite,
  optionId: string,
  config: Pick<MediaGalleryCategoryConfig, "type" | "options">,
): AccountMediaLibraryCategoryAssignmentWrite {
  const selectedIds = categoryAssignmentToOptionIds(current, config.options);
  const isSelected = selectedIds.includes(optionId);
  if (isSelected) {
    return defaultCategoryAssignmentWrite(config);
  }
  return buildCategoryAssignmentFromSelection({
    config,
    scope: "selected",
    selectedOptionIds: [optionId],
  });
}

export function toggleAssociationCategoryOption(
  current: AccountMediaLibraryCategoryAssignmentWrite,
  optionId: string,
  config: Pick<MediaGalleryCategoryConfig, "type" | "options">,
): AccountMediaLibraryCategoryAssignmentWrite {
  const selectedIds = categoryAssignmentToOptionIds(current, config.options);
  const isSelected = selectedIds.includes(optionId);
  const nextIds = isSelected
    ? selectedIds.filter((id) => id !== optionId)
    : [...selectedIds, optionId];

  if (nextIds.length === 0) {
    return defaultCategoryAssignmentWrite(config);
  }

  return buildCategoryAssignmentFromSelection({
    config,
    scope: "selected",
    selectedOptionIds: nextIds,
  });
}

export function selectAllCategoryScope(
  config: Pick<MediaGalleryCategoryConfig, "type">,
): AccountMediaLibraryCategoryAssignmentWrite {
  return defaultCategoryAssignmentWrite(config);
}

export function itemBelongsToCategoryGroup(
  item: Pick<AccountMediaLibraryItem, "ageGroup" | "categoryAssignment" | "categoryStatus">,
  groupOption: MediaGalleryCategoryOption,
  config: Pick<MediaGalleryCategoryConfig, "type">,
): boolean {
  const effective = getEffectiveCategoryFromItem(item, config.type);
  if (effective.status === "needs_reclassification") return false;
  if (effective.scope === "all") return true;
  const targetSet = new Set(effective.targets.map((target) => String(target)));
  return groupOption.targetKeys.some((key) => targetSet.has(String(key)));
}

export function formatCategoryAssignmentLabels(
  item: Pick<
    AccountMediaLibraryItem,
    "ageGroup" | "categoryAssignment" | "categoryStatus" | "resolvedTargets"
  >,
  config: MediaGalleryCategoryConfig,
): string[] {
  const effective = getEffectiveCategoryFromItem(item, config.type);
  if (effective.status === "needs_reclassification") {
    return ["Needs recategorisation"];
  }
  if (effective.scope === "all") {
    return [config.allLabel];
  }

  const labels = categoryAssignmentToOptionIds(
    { type: effective.type, scope: effective.scope, targets: effective.targets },
    config.options,
  )
    .map((id) => config.options.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  if (labels.length > 0) {
    return labels;
  }

  const resolved = (item.resolvedTargets ?? [])
    .filter((target) => effective.targets.some((entry) => String(entry) === String(target.id)))
    .map((target) => target.label);
  if (resolved.length > 0) {
    return resolved;
  }

  return effective.targets.map(String);
}

export function formatCategoryAssignmentLabel(
  item: Pick<
    AccountMediaLibraryItem,
    "ageGroup" | "categoryAssignment" | "categoryStatus" | "resolvedTargets"
  >,
  config: MediaGalleryCategoryConfig,
): string {
  return formatCategoryAssignmentLabels(item, config).join(", ");
}

export function itemNeedsRecategorisation(
  item: Pick<AccountMediaLibraryItem, "categoryStatus">,
): boolean {
  return item.categoryStatus === "needs_reclassification";
}

export function isAllScopeAssignment(
  assignment: Pick<AccountMediaLibraryCategoryAssignment, "scope">,
): boolean {
  return assignment.scope === "all";
}
