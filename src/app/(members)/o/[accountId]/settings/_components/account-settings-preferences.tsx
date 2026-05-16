"use client";

import { Settings } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type WeekdayKey,
  WEEKDAY_OPTIONS,
  daysUntilNextDelivery,
} from "@/features/settings/bundle-delivery-weekdays";

import { SaveSettingsDialog } from "./save-settings-dialog";
import { SettingsSelectRow } from "./settings-select-row";
import { SettingsToggleRow } from "./settings-toggle-row";
import { settingsPrefId } from "../_constants/pref-ids";
import { useAccountSettingsPreferencesState } from "../_hooks/use-account-settings-preferences-state";

import type { CompetitionGroupingKey } from "../_types/settings-draft";
import type { AccountSettingsData } from "@/types/api/account";

export type AccountSettingsPreferencesProps = {
  accountId: string;
  payload: AccountSettingsData;
};

export function AccountSettingsPreferences({
  accountId,
  payload,
}: AccountSettingsPreferencesProps) {
  const {
    mutation,
    isClub,
    showAssocGrouping,
    showClubSplitSeniors,
    hasParsableDeliveryFromServer,
    baselineDraft,
    draft,
    setDraft,
    saveDialogOpen,
    setSaveDialogOpen,
    hasChanges,
    partialPatch,
    canSubmit,
    saveDisabled,
    handleConfirmSave,
    saveForbidden,
    saveExtraDetail,
    openSaveDialog,
  } = useAccountSettingsPreferencesState({ accountId, payload });

  return (
    <div className="space-y-4">
      {saveForbidden ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-lg border px-4 py-3 text-sm"
        >
          Saving is blocked (403): enable the <strong>saveAccountSettings</strong> permission for
          your role in Strapi, then try again.
        </div>
      ) : null}

      {!saveForbidden && mutation.isError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 rounded-lg border px-4 py-3 text-sm text-red-950 dark:text-red-100"
        >
          <span className="font-medium">{mutation.error.message}</span>
          {saveExtraDetail ? (
            <>
              {" "}
              <span className="text-muted-foreground">{saveExtraDetail}</span>
            </>
          ) : null}
        </div>
      ) : null}

      <MetricComparisonCard
        className="shadow-sm"
        layout="card"
        headerClassName="px-4 py-4 sm:px-5"
        bodyClassName="p-0"
        footerClassName="px-4 py-4 sm:px-5"
        title="Settings"
        icon={<Settings className="text-primary size-5 shrink-0" aria-hidden />}
        body={
          <div>
            <div className="space-y-3 px-6 pt-6 pb-6">
              <p className="text-sm leading-relaxed">
                Manage delivery and bundle preferences for your organisation.
              </p>
              <TypographyMuted className="text-xs leading-relaxed">
                {isClub ? "Club" : "Association"}
                {" · "}
                {payload.Sport}
              </TypographyMuted>
            </div>

            <ul>
              <SettingsSelectRow
                id={settingsPrefId("deliveryWeekdayKey")}
                title="Bundle delivery day"
                description={`Weekly bundles target this delivery day — about ${daysUntilNextDelivery(draft.deliveryWeekdayKey)} days until the next cycle from today.${!hasParsableDeliveryFromServer ? " Could not resolve your saved weekday from CMS (name/id); the selection defaults until you save." : ""}`}
                disabled={mutation.isPending}
              >
                <Select
                  value={draft.deliveryWeekdayKey}
                  onValueChange={(next) =>
                    setDraft((prev) => ({ ...prev, deliveryWeekdayKey: next as WeekdayKey }))
                  }
                  disabled={mutation.isPending || saveForbidden}
                >
                  <SelectTrigger className="h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_OPTIONS.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingsSelectRow>

              {showAssocGrouping ? (
                <SettingsSelectRow
                  id={settingsPrefId("competitionsGroupedBy")}
                  title="Competitions grouped by"
                  description="Association preference — organise competition lists by competition or grade."
                  disabled={mutation.isPending || saveForbidden}
                >
                  <Select
                    value={draft.competitionsGroupedBy}
                    onValueChange={(next) =>
                      setDraft((prev) => ({
                        ...prev,
                        competitionsGroupedBy: next as CompetitionGroupingKey,
                      }))
                    }
                    disabled={mutation.isPending || saveForbidden}
                  >
                    <SelectTrigger className="h-9 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="grade">Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsSelectRow>
              ) : null}

              <SettingsToggleRow
                id={settingsPrefId("includeJuniorSurnames")}
                title={
                  <span className="text-sm leading-snug font-medium">
                    {draft.includeJuniorSurnames
                      ? "Junior surnames included"
                      : "Junior surnames not included"}{" "}
                    <span className="text-muted-foreground font-medium">· In assets</span>
                  </span>
                }
                description="Turn this off to omit junior players’ surnames on bundle assets — for example when your club or association prefers not to publish them on junior outputs. Turn on to include surnames in those bundle assets."
                checked={draft.includeJuniorSurnames}
                disabled={mutation.isPending || saveForbidden}
                onCheckedChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    includeJuniorSurnames: next,
                  }))
                }
              />

              {showClubSplitSeniors ? (
                <SettingsToggleRow
                  id={settingsPrefId("splitSeniorsAndMasters")}
                  title={<span className="text-sm font-medium">Split seniors and masters</span>}
                  description="Club preference — separates seniors and masters into distinct bundle groups when enabled."
                  checked={draft.splitSeniorsAndMasters}
                  disabled={mutation.isPending || saveForbidden}
                  onCheckedChange={(next) =>
                    setDraft((prev) => ({ ...prev, splitSeniorsAndMasters: next }))
                  }
                />
              ) : null}
            </ul>
          </div>
        }
        footer={
          <div className="flex w-full min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <TypographyMuted className="text-xs">
              {!hasChanges
                ? "All preferences match saved values."
                : canSubmit
                  ? "Review changes before saving."
                  : "Adjust a preference above — some choices may be ignored until the CMS recognises new fields."}
            </TypographyMuted>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending || !hasChanges || saveForbidden}
                onClick={() => setDraft(baselineDraft)}
              >
                Reset
              </Button>
              <Button
                type="button"
                disabled={saveDisabled || saveForbidden}
                onClick={openSaveDialog}
              >
                {mutation.isPending ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </div>
        }
      />

      <SaveSettingsDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        partialPatch={partialPatch}
        draftDeliveryWeekdayKey={draft.deliveryWeekdayKey}
        mutationPending={mutation.isPending}
        onConfirmSave={handleConfirmSave}
      />
    </div>
  );
}
