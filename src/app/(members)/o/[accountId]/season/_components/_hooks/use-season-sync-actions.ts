"use client";

import { toastError, toastSuccess } from "@/lib/notify";

import type {
  SeasonOverviewSyncDialogProps,
  SeasonCompetitionSyncGradesDialogProps,
  SeasonGradeSyncDialogProps,
} from "../_types";

type UseSeasonOverviewSyncActionArgs = Pick<
  SeasonOverviewSyncDialogProps,
  "orgSync" | "onOpenChange"
>;

export function useSeasonOverviewSyncAction({
  orgSync,
  onOpenChange,
}: UseSeasonOverviewSyncActionArgs) {
  const runSync = () => {
    void (async () => {
      try {
        await orgSync.triggerSync();
        toastSuccess("Sync queued successfully");
        onOpenChange(false);
      } catch (error) {
        toastError(error, "Could not queue sync");
      }
    })();
  };

  return { runSync };
}

type UseSeasonCompetitionGradesSyncActionArgs = Pick<
  SeasonCompetitionSyncGradesDialogProps,
  "cmsCompetitionNumericId" | "mutateAsync" | "onOpenChange"
>;

export function useSeasonCompetitionGradesSyncAction({
  cmsCompetitionNumericId,
  mutateAsync,
  onOpenChange,
}: UseSeasonCompetitionGradesSyncActionArgs) {
  const runSync = () => {
    void (async () => {
      try {
        await mutateAsync({
          competitionId: cmsCompetitionNumericId,
        });
        toastSuccess(
          "Grade sync started",
          "This may take a few minutes. Use Reload Your Season to see the latest list after processing finishes.",
        );
        onOpenChange(false);
      } catch (error) {
        toastError(error, "Could not start grade sync");
      }
    })();
  };

  return { runSync };
}

type UseSeasonGradeSyncActionArgs = Pick<
  SeasonGradeSyncDialogProps,
  | "cmsCompetitionNumericId"
  | "cmsGradeNumericId"
  | "teamsMutateAsync"
  | "fixturesMutateAsync"
  | "onSynced"
>;

export function useSeasonGradeSyncAction({
  cmsCompetitionNumericId,
  cmsGradeNumericId,
  teamsMutateAsync,
  fixturesMutateAsync,
  onSynced,
}: UseSeasonGradeSyncActionArgs) {
  const runSync = () => {
    void (async () => {
      const [teamsResult, fixturesResult] = await Promise.allSettled([
        teamsMutateAsync({
          competitionId: cmsCompetitionNumericId,
        }),
        fixturesMutateAsync({
          id: cmsGradeNumericId,
        }),
      ]);

      const teamsOk = teamsResult.status === "fulfilled";
      const fixturesOk = fixturesResult.status === "fulfilled";

      if (teamsOk && fixturesOk) {
        toastSuccess(
          "Grade sync started",
          "This can take a few minutes. This page will refresh in a moment.",
        );
      } else if (teamsOk) {
        toastSuccess(
          "Grade sync started",
          "This can take a few minutes. This page will refresh in a moment.",
        );
        toastError(
          fixturesResult.status === "rejected" ? fixturesResult.reason : "Unknown error",
          "Something did not finish updating",
        );
      } else if (fixturesOk) {
        toastSuccess(
          "Grade sync started",
          "This can take a few minutes. This page will refresh in a moment.",
        );
        toastError(
          teamsResult.status === "rejected" ? teamsResult.reason : "Unknown error",
          "Something did not finish updating",
        );
      } else {
        const teamMsg =
          teamsResult.status === "rejected"
            ? teamsResult.reason instanceof Error
              ? teamsResult.reason.message
              : String(teamsResult.reason)
            : "";
        const fixtureMsg =
          fixturesResult.status === "rejected"
            ? fixturesResult.reason instanceof Error
              ? fixturesResult.reason.message
              : String(fixturesResult.reason)
            : "";
        toastError(
          [teamMsg, fixtureMsg].filter(Boolean).join(" - ") || "Unknown error",
          "Could not sync this grade",
        );
        return;
      }

      onSynced();
    })();
  };

  return { runSync };
}
