import { describe, expect, it } from "vitest";

import { clubGradeOrderingFixture } from "@/types/api/grade-ordering.fixtures";

import {
  buildClearAllPayload,
  buildPutPayload,
  draftFromResponse,
  equalDraft,
  reorderGroupItems,
} from "./grade-ordering-draft";

describe("grade-ordering-draft", () => {
  it("builds draft from canonical response ordered by resolvedPosition", () => {
    const draft = draftFromResponse(clubGradeOrderingFixture.data);
    expect(draft.revision).toBe(0);
    expect(draft.groups).toHaveLength(2);
    expect(draft.groups[0]?.itemIds).toEqual([10]);
    expect(draft.groups[1]?.itemIds).toEqual([781]);
  });

  it("detects dirty when item order changes", () => {
    const baseline = draftFromResponse(clubGradeOrderingFixture.data);
    const withTwoJunior = {
      ...baseline,
      groups: baseline.groups.map((group) =>
        group.groupKey === "junior" ? { ...group, itemIds: [10, 99] } : group,
      ),
    };
    const changed = reorderGroupItems(withTwoJunior, "junior", [99, 10]);
    expect(equalDraft(withTwoJunior, changed)).toBe(false);
  });

  it("builds PUT payload with expectedRevision and gradeIds order", () => {
    const draft = draftFromResponse(clubGradeOrderingFixture.data);
    const payload = buildPutPayload(draft);
    expect(payload.expectedRevision).toBe(0);
    expect(payload.organisation).toEqual({ type: "club", id: 123 });
    expect(payload.groups[0]?.gradeIds).toEqual([10]);
  });

  it("builds clear-all payload with empty gradeIds per group", () => {
    const draft = draftFromResponse(clubGradeOrderingFixture.data);
    const payload = buildClearAllPayload(draft);
    expect(payload.groups.every((g) => g.gradeIds.length === 0)).toBe(true);
  });
});
