import type { GradeOrderingResponse } from "./grade-ordering";

export const clubGradeOrderingFixture: GradeOrderingResponse = {
  data: {
    contractVersion: 1,
    account: { id: 575, accountType: "Club", sport: "Cricket" },
    organisation: { type: "club", id: 123, name: "North Cricket Club" },
    revision: 0,
    groups: [
      {
        groupType: "club-age-group",
        groupKey: "junior",
        groupLabel: "Junior",
        competition: null,
        items: [
          {
            gradeId: 10,
            providerGradeId: "phq-grade-10",
            gradeName: "Under 12 Blue",
            ageGroup: "Under 12",
            providerPosition: 4,
            savedPosition: null,
            resolvedPosition: 0,
            isCustomOrdered: false,
            sourceTeamIds: [81],
          },
        ],
      },
      {
        groupType: "club-age-group",
        groupKey: "senior",
        groupLabel: "Senior",
        competition: null,
        items: [
          {
            gradeId: 781,
            providerGradeId: "phq-grade-781",
            gradeName: "First Grade",
            ageGroup: "senior",
            providerPosition: 1,
            savedPosition: null,
            resolvedPosition: 0,
            isCustomOrdered: false,
            sourceTeamIds: [94, 102],
          },
        ],
      },
    ],
    generatedAt: "2026-07-16T08:30:00.000Z",
  },
};

export const associationGradeOrderingFixture: GradeOrderingResponse = {
  data: {
    contractVersion: 1,
    account: { id: 575, accountType: "Association", sport: "Cricket" },
    organisation: { type: "association", id: 50, name: "Metro Association" },
    revision: 3,
    groups: [
      {
        groupType: "competition",
        groupKey: "competition:18031",
        groupLabel: "Premier Cricket",
        competition: {
          id: 18031,
          providerCompetitionId: "phq-comp-415",
          name: "Premier Cricket",
          season: "2025/26",
          status: "active",
          startDate: null,
          endDate: null,
          isActive: true,
        },
        items: [
          {
            gradeId: 415,
            providerGradeId: "phq-grade-415",
            gradeName: "First XI",
            ageGroup: "senior",
            providerPosition: 1,
            savedPosition: 0,
            resolvedPosition: 0,
            isCustomOrdered: true,
            sourceTeamIds: [],
          },
        ],
      },
    ],
    generatedAt: "2026-07-16T08:30:00.000Z",
  },
};

export const emptyGradeOrderingFixture: GradeOrderingResponse = {
  data: {
    contractVersion: 1,
    account: { id: 575, accountType: "Club", sport: "Cricket" },
    organisation: { type: "club", id: 123, name: "North Cricket Club" },
    revision: 0,
    groups: [],
    generatedAt: "2026-07-16T08:30:00.000Z",
  },
};
