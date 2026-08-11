import { z } from "zod";

export const sourceRefSchema = z.object({
  url: z.string().url(),
  retrieved: z.string().min(1),
  note: z.string().min(1),
});

export const nationSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  membership: z.enum(["full", "associate"]),
  flagCode: z.string().min(1),
  flagPath: z.string().startsWith("/dummyAssetData/flags/"),
  isIsoCountry: z.boolean(),
  visualAssetException: z
    .object({
      reason: z.string().min(1),
      policy: z.string().min(1),
      status: z.string().min(1),
      sourceUrl: z.string().url().optional(),
      licence: z.string().min(1).optional(),
      retrieved: z.string().min(1).optional(),
      rationale: z.string().min(1).optional(),
    })
    .optional(),
  kind: z.literal("historical"),
});

export const tournamentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  edition: z.number().int(),
  format: z.enum(["ODI", "T20"]),
  hostSummary: z.string().min(1),
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  primaryVenue: z
    .object({
      id: z.string().min(1),
      canonicalName: z.string().min(1),
      displayName: z.string().min(1),
    })
    .optional(),
  sources: z.array(sourceRefSchema).min(1),
  kind: z.literal("historical"),
});

export const stageSchema = z.object({
  id: z.string().min(1),
  tournamentId: z.string().min(1),
  name: z.string().min(1),
  displayLabel: z.string().min(1),
  ladderBlockIndex: z.number().int().min(0).max(7),
  participantNationIds: z.array(z.string().min(1)).min(2),
  sources: z.array(sourceRefSchema).min(1),
  kind: z.literal("historical"),
});

export const venueSchema = z.object({
  id: z.string().min(1),
  canonicalName: z.string().min(1),
  displayName: z.string().min(1),
  kind: z.literal("historical"),
});

export const fixtureSchema = z.object({
  id: z.string().min(1),
  tournamentId: z.string().min(1),
  homeNationId: z.string().min(1),
  awayNationId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  venueId: z.string().min(1),
  format: z.enum(["ODI", "T20"]),
  usedBy: z.array(z.string().min(1)).min(1),
  sources: z.array(sourceRefSchema).min(1),
  kind: z.literal("historical"),
});

export const playerSchema = z.object({
  name: z.string().min(1),
  nationId: z.string().min(1),
  role: z.string().min(1).optional(),
});

export const playerPoolSchema = z.object({
  id: z.string().min(1),
  tournamentId: z.string().min(1),
  assetCompositionIds: z.array(z.string().min(1)).min(1),
  selectionPolicy: z.string().min(1),
  players: z.array(playerSchema).min(1),
  sources: z.array(sourceRefSchema).min(1),
  kind: z.literal("historical"),
});

export const datasetBindingSchema = z.object({
  compositionId: z.string().min(1),
  fileName: z.string().min(1),
  publicPath: z.string().startsWith("/dummyAssetData/Cricket/"),
  expectedDataLength: z.number().int().positive(),
  expectedFramesLength: z.number().int().positive(),
  tournamentIds: z.array(z.string().min(1)).min(1),
  stageIds: z.array(z.string().min(1)).optional(),
  fixtureIds: z.array(z.string().min(1)).optional(),
  playerPoolIds: z.array(z.string().min(1)).optional(),
  venueContextIds: z.array(z.string().min(1)).optional(),
});

export const cricketHistoricalDemoManifestSchema = z.object({
  version: z.string().min(1),
  generatedFor: z.string().min(1),
  retrievedAt: z.string().min(1),
  labelling: z.object({
    statistics: z.literal("Demo Recreation — Fictional Statistics"),
    standings: z.literal("Demo Recreation — Fictional Standings"),
  }),
  notes: z.array(z.string().min(1)).min(1),
  nations: z.array(nationSchema).min(17),
  flagAssets: z.object({
    preferredSource: z.string().min(1),
    preferredSourceUrl: z.string().url(),
    targetDirectory: z.string().min(1),
    publicBasePath: z.string().min(1),
    requiredFiles: z.array(z.string().endsWith(".svg")).min(17),
    westIndiesException: z.object({
      flagCode: z.literal("wi"),
      isIsoCountry: z.literal(false),
      status: z.string().min(1),
      constraint: z.string().min(1),
      sourceUrl: z.string().url().optional(),
      licence: z.string().min(1).optional(),
      retrieved: z.string().min(1).optional(),
      rationale: z.string().min(1).optional(),
      localPath: z.string().startsWith("/dummyAssetData/flags/").optional(),
    }),
    kind: z.literal("historical"),
  }),
  tournaments: z.array(tournamentSchema).length(8),
  stages: z.array(stageSchema).length(8),
  venues: z.array(venueSchema).min(1),
  fixtures: z.array(fixtureSchema).min(1),
  playerPools: z.array(playerPoolSchema).min(1),
  syntheticGeneration: z.object({
    kind: z.literal("synthetic-rules"),
    isSynthetic: z.literal(true),
    seed: z.string().min(1),
    version: z.string().min(1),
    requiredLabels: z.object({
      statistics: z.literal("Demo Recreation — Fictional Statistics"),
      standings: z.literal("Demo Recreation — Fictional Standings"),
    }),
    ladderRules: z.record(z.string(), z.unknown()),
    battingGuidelines: z.record(z.string(), z.unknown()),
    bowlingGuidelines: z.record(z.string(), z.unknown()),
    scorecardGuidelines: z.record(z.string(), z.unknown()),
    candidateExamples: z
      .object({
        isSynthetic: z.literal(true),
        note: z.string().min(1),
      })
      .passthrough(),
  }),
  datasetBindings: z.array(datasetBindingSchema).length(10),
});

export type CricketHistoricalDemoManifest = z.infer<typeof cricketHistoricalDemoManifestSchema>;
