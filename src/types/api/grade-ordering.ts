/** Grade ordering API types — CMS contract v1. @see Backend/docs/api/grade-ordering-development-contract.md */

export type GradeOrderingOrganisationType = "club" | "association";

export type GradeOrderingGroupType = "club-age-group" | "competition";

export type ClubAgeGroupKey = "junior" | "senior" | "masters" | "unclassified";

export type GradeOrderingGroupKey = ClubAgeGroupKey | `competition:${number}`;

export interface GradeOrderingOrganisationRef {
  type: GradeOrderingOrganisationType;
  id: number;
}

export interface GradeOrderingAccountDto {
  id: number;
  accountType: string | null;
  sport: string | null;
}

export interface GradeOrderingOrganisationDto {
  type: GradeOrderingOrganisationType;
  id: number;
  name: string;
}

export interface GradeOrderingCompetitionDto {
  id: number;
  providerCompetitionId: string | null;
  name: string;
  season: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface GradeOrderingItemDto {
  gradeId: number;
  providerGradeId: string | null;
  gradeName: string;
  ageGroup: string | null;
  providerPosition: number | null;
  savedPosition: number | null;
  resolvedPosition: number;
  isCustomOrdered: boolean;
  sourceTeamIds: number[];
}

export interface GradeOrderingGroupDto {
  groupType: GradeOrderingGroupType;
  groupKey: GradeOrderingGroupKey;
  groupLabel: string;
  competition: GradeOrderingCompetitionDto | null;
  items: GradeOrderingItemDto[];
}

export interface GradeOrderingResponseData {
  contractVersion: 1;
  account: GradeOrderingAccountDto;
  organisation: GradeOrderingOrganisationDto;
  revision: number;
  groups: GradeOrderingGroupDto[];
  generatedAt: string;
}

export interface GradeOrderingResponse {
  data: GradeOrderingResponseData;
}

export interface ReplaceGradeOrderingGroupInput {
  groupType: GradeOrderingGroupType;
  groupKey: GradeOrderingGroupKey;
  gradeIds: number[];
}

export interface ReplaceGradeOrderingRequest {
  expectedRevision: number;
  organisation: GradeOrderingOrganisationRef;
  groups: ReplaceGradeOrderingGroupInput[];
}

export type GradeOrderingErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_ACCOUNT_ID"
  | "INVALID_QUERY"
  | "INVALID_PAYLOAD"
  | "ACCOUNT_NOT_FOUND"
  | "ORGANISATION_NOT_FOUND"
  | "ORDERING_REVISION_CONFLICT"
  | "DUPLICATE_GROUP"
  | "DUPLICATE_GRADE_ID"
  | "GRADE_NOT_IN_ORGANISATION"
  | "GRADE_GROUP_MISMATCH"
  | "INVALID_GROUP"
  | "LEGACY_ORDERING_ENDPOINT_REMOVED"
  | "INTERNAL_ERROR";

export interface GradeOrderingApiErrorEnvelope {
  data: null;
  error: {
    status: number;
    name: string;
    code: GradeOrderingErrorCode;
    message: string;
    requestId: string | null;
    details?: Record<string, unknown>;
  };
}

export interface GradeOrderingRevisionConflictDetails {
  expectedRevision: number;
  currentRevision: number;
}

export interface GradeOrderingGetParams {
  organisationType: GradeOrderingOrganisationType;
  organisationId: number;
}
