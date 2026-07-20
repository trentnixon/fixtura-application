import type {
  GradeOrderingGroupDto,
  GradeOrderingItemDto,
  GradeOrderingResponseData,
  ReplaceGradeOrderingGroupInput,
  ReplaceGradeOrderingRequest,
} from "@/types/api/grade-ordering";

export type GradeOrderingDraftGroup = {
  groupType: GradeOrderingGroupDto["groupType"];
  groupKey: GradeOrderingGroupDto["groupKey"];
  label: string;
  itemIds: number[];
};

export type GradeOrderingDraft = {
  revision: number;
  organisation: GradeOrderingResponseData["organisation"];
  groups: GradeOrderingDraftGroup[];
};

export type GradeOrderingGradeLookup = Map<number, GradeOrderingItemDto>;

export function gradeLookupFromResponse(data: GradeOrderingResponseData): GradeOrderingGradeLookup {
  const map = new Map<number, GradeOrderingItemDto>();
  for (const group of data.groups) {
    for (const item of group.items) {
      map.set(item.gradeId, item);
    }
  }
  return map;
}

export function draftFromResponse(data: GradeOrderingResponseData): GradeOrderingDraft {
  return {
    revision: data.revision,
    organisation: data.organisation,
    groups: data.groups.map((group) => ({
      groupType: group.groupType,
      groupKey: group.groupKey,
      label: group.groupLabel,
      itemIds: [...group.items]
        .sort((a, b) => a.resolvedPosition - b.resolvedPosition)
        .map((item) => item.gradeId),
    })),
  };
}

export function equalDraft(a: GradeOrderingDraft, b: GradeOrderingDraft): boolean {
  if (a.revision !== b.revision) return false;
  if (a.organisation.type !== b.organisation.type || a.organisation.id !== b.organisation.id) {
    return false;
  }
  if (a.groups.length !== b.groups.length) return false;
  for (let i = 0; i < a.groups.length; i += 1) {
    const ga = a.groups[i];
    const gb = b.groups[i];
    if (ga.groupType !== gb.groupType || ga.groupKey !== gb.groupKey) return false;
    if (ga.itemIds.length !== gb.itemIds.length) return false;
    for (let j = 0; j < ga.itemIds.length; j += 1) {
      if (ga.itemIds[j] !== gb.itemIds[j]) return false;
    }
  }
  return true;
}

export function reorderGroupItems(
  draft: GradeOrderingDraft,
  groupKey: GradeOrderingDraftGroup["groupKey"],
  itemIds: number[],
): GradeOrderingDraft {
  return {
    ...draft,
    groups: draft.groups.map((group) =>
      group.groupKey === groupKey ? { ...group, itemIds } : group,
    ),
  };
}

export function buildPutPayload(draft: GradeOrderingDraft): ReplaceGradeOrderingRequest {
  const groups: ReplaceGradeOrderingGroupInput[] = draft.groups.map((group) => ({
    groupType: group.groupType,
    groupKey: group.groupKey,
    gradeIds: [...group.itemIds],
  }));

  return {
    expectedRevision: draft.revision,
    organisation: {
      type: draft.organisation.type,
      id: draft.organisation.id,
    },
    groups,
  };
}

export function buildClearAllPayload(draft: GradeOrderingDraft): ReplaceGradeOrderingRequest {
  return {
    expectedRevision: draft.revision,
    organisation: {
      type: draft.organisation.type,
      id: draft.organisation.id,
    },
    groups: draft.groups.map((group) => ({
      groupType: group.groupType,
      groupKey: group.groupKey,
      gradeIds: [],
    })),
  };
}
